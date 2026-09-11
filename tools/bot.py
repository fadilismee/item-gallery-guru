"""
Buana Computer - Telegram Bot Manager (Windows 10/11 + Python 3.10+)
- Kelola katalog via Telegram: isi/ubah/edit/hapus + stock
- Specs ketik baris "Label: Value" simless
- Banner hero/footer
- Image via Catbox (free 200MB, tanpa key, 5-20/hari aman) → link → JSON → git push → Vercel auto deploy
- Tokopedia/Shopee link hidden jika kosong
- Rating default 4.5 + badge "Produk Pilihan" di semua card

Setup:
  pip install python-telegram-bot requests python-dotenv
  Buat .env di tools/.env:
    TELEGRAM_TOKEN=123456:ABC...
    GITHUB_TOKEN=ghp_xxx
    GITHUB_REPO=fadilismee/item-gallery-guru
    GITHUB_BRANCH=main
    ALLOWED_CHAT_ID=123456789
  Jalankan: python tools/bot.py
  Task Scheduler -> At startup -> python C:\Project\Kerjaan\Buanacomp\tools\bot.py
"""
import os
import json
import base64
import subprocess
import tempfile
from pathlib import Path

import requests
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters, ConversationHandler

load_dotenv(Path(__file__).parent / ".env")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
GITHUB_REPO = os.getenv("GITHUB_REPO", "fadilismee/item-gallery-guru")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")
ALLOWED_CHAT_ID = os.getenv("ALLOWED_CHAT_ID", "")
CATBOX_URL = "https://catbox.moe/user/api.php"

BASE_DIR = Path(__file__).parent.parent
PRODUCTS_JSON = BASE_DIR / "src" / "data" / "products.json"
BANNERS_JSON = BASE_DIR / "src" / "data" / "banners.json"

# Conversation states
ASK_NAME, ASK_BRAND, ASK_CATEGORY, ASK_PRICE, ASK_OLDPRICE, ASK_STOCK, ASK_CONDITION, ASK_SHORTDESC, ASK_DESC, ASK_SPECS, ASK_TOKPED, ASK_SHOPEE, ASK_PHOTOS, CONFIRM = range(14)

CATEGORIES = ["Laptop", "PC Rakitan", "Monitor", "Komponen", "Aksesoris", "Storage"]

def is_allowed(update: Update) -> bool:
    if not ALLOWED_CHAT_ID:
        return True
    return str(update.effective_chat.id) == str(ALLOWED_CHAT_ID)

def load_products():
    return json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))

def save_products(products):
    PRODUCTS_JSON.write_text(json.dumps(products, indent=2, ensure_ascii=False), encoding="utf-8")

def upload_catbox(file_path: str) -> str:
    with open(file_path, "rb") as f:
        r = requests.post(CATBOX_URL, data={"reqtype": "fileupload"}, files={"fileToUpload": f}, timeout=30)
        r.raise_for_status()
        url = r.text.strip()
        if not url.startswith("http"):
            raise RuntimeError(f"Catbox failed: {r.text[:200]}")
        return url

def git_push(message: str):
    subprocess.run(["git", "add", str(PRODUCTS_JSON.relative_to(BASE_DIR))], cwd=BASE_DIR, check=True)
    # also banners if exists
    if BANNERS_JSON.exists():
        subprocess.run(["git", "add", str(BANNERS_JSON.relative_to(BASE_DIR))], cwd=BASE_DIR, check=True)
    subprocess.run(["git", "commit", "-m", message], cwd=BASE_DIR, check=True)
    subprocess.run(["git", "push", "origin", GITHUB_BRANCH], cwd=BASE_DIR, check=True)

# In-memory draft per chat
drafts = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update):
        return
    await update.message.reply_text(
        "Halo! Buana Bot siap.\n"
        "/add - Tambah produk lengkap\n"
        "/edit <id> - Edit produk\n"
        "/hapus <id> - Hapus produk\n"
        "/list - List produk + stock\n"
        "/stock <id> <angka> - Update stock cepat\n"
        "/banner - Ganti banner hero/footer\n"
        "/help - Bantuan"
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await start(update, context)

async def list_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return
    products = load_products()
    lines = [f"{p['id']} | {p['name'][:30]} | stock:{p['stock']} | {p['price']}" for p in products]
    text = "\n".join(lines) or "Kosong"
    await update.message.reply_text(f"📦 {len(products)} produk:\n{text[:3500]}")

async def stock_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return
    try:
        _, pid, val = update.message.text.split()
        val = int(val)
    except:
        await update.message.reply_text("Pakai: /stock <id> <angka>\nContoh: /stock laptop-gaming-rtx-4060 12")
        return
    products = load_products()
    for p in products:
        if p["id"] == pid:
            p["stock"] = val
            save_products(products)
            git_push(f"bot: stock {pid} -> {val}")
            await update.message.reply_text(f"✅ Stock {pid} jadi {val} — sudah push ke GitHub, Vercel lagi deploy.")
            return
    await update.message.reply_text(f"❌ id {pid} tidak ketemu")

async def hapus_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return
    try:
        pid = update.message.text.split()[1]
    except:
        await update.message.reply_text("Pakai: /hapus <id>")
        return
    products = load_products()
    new = [p for p in products if p["id"] != pid]
    if len(new) == len(products):
        await update.message.reply_text("❌ id tidak ketemu")
        return
    save_products(new)
    git_push(f"bot: hapus {pid}")
    await update.message.reply_text(f"✅ Hapus {pid} — push done, Vercel deploy.")

# --- EDIT FLOW ---
EDIT_CHOOSE_FIELD, EDIT_NEW_VALUE, BANNER_CHOICE, BANNER_PHOTO = range(14, 18)

async def edit_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return ConversationHandler.END
    try:
        pid = update.message.text.split()[1]
    except:
        await update.message.reply_text("Pakai: /edit <id>\nContoh: /edit laptop-gaming-rtx-4060")
        return ConversationHandler.END
    products = load_products()
    prod = next((p for p in products if p["id"] == pid), None)
    if not prod:
        await update.message.reply_text("❌ id tidak ketemu")
        return ConversationHandler.END
    context.user_data["edit_id"] = pid
    await update.message.reply_text(
        f"Edit {pid} — pilih field:\n"
        "name, brand, category, price, oldPrice, stock, condition, shortDescription, description, tokopediaUrl, shopeeUrl\n"
        "Ketik nama field, contoh: stock"
    )
    return EDIT_CHOOSE_FIELD

async def edit_choose_field(update: Update, context: ContextTypes.DEFAULT_TYPE):
    field = update.message.text.strip()
    allowed = ["name","brand","category","price","oldPrice","stock","condition","shortDescription","description","tokopediaUrl","shopeeUrl"]
    if field not in allowed:
        await update.message.reply_text(f"Field harus salah satu: {', '.join(allowed)}")
        return EDIT_CHOOSE_FIELD
    context.user_data["edit_field"] = field
    if field == "specs":
        await update.message.reply_text("Untuk specs, ketik baris \"Label: Value\" satu per satu, /done selesai. Saat ini edit full specs belum, pakai /add untuk baru.")
        return EDIT_CHOOSE_FIELD
    await update.message.reply_text(f"Kirim nilai baru untuk {field} (ketik - untuk kosongkan oldPrice/tokped/shopee):")
    return EDIT_NEW_VALUE

async def edit_new_value(update: Update, context: ContextTypes.DEFAULT_TYPE):
    pid = context.user_data.get("edit_id")
    field = context.user_data.get("edit_field")
    val = update.message.text.strip()
    products = load_products()
    for p in products:
        if p["id"] == pid:
            if field in ["price","oldPrice","stock"]:
                if val in ["", "-", "skip", "kosong"] and field == "oldPrice":
                    p.pop("oldPrice", None)
                elif field == "oldPrice" and val:
                    p[field] = int(val.replace(".","").replace(",",""))
                elif field in ["price","stock"]:
                    p[field] = int(val.replace(".","").replace(",",""))
                else:
                    p[field] = val
            elif field == "category" and val not in CATEGORIES:
                await update.message.reply_text(f"Kategori harus: {', '.join(CATEGORIES)}")
                return EDIT_NEW_VALUE
            elif field == "condition" and val not in ["Baru","Bekas"]:
                await update.message.reply_text("Kondisi Baru/Bekas")
                return EDIT_NEW_VALUE
            else:
                if val == "-" and field in ["tokopediaUrl","shopeeUrl"]:
                    p[field] = ""
                else:
                    p[field] = val
            save_products(products)
            git_push(f"bot: edit {pid} {field}")
            await update.message.reply_text(f"✅ Edit {pid} {field} → {val} — push done")
            return ConversationHandler.END
    await update.message.reply_text("❌ id hilang")
    return ConversationHandler.END

async def banner_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return ConversationHandler.END
    await update.message.reply_text("Banner mana? Ketik: hero atau footer\nhero = carousel 3 poster atas, footer = PurePoster di atas testimoni (sekarang poster1)")
    return BANNER_CHOICE

async def banner_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    choice = update.message.text.strip().lower()
    if choice not in ["hero","footer"]:
        await update.message.reply_text("Ketik hero atau footer")
        return BANNER_CHOICE
    context.user_data["banner_choice"] = choice
    await update.message.reply_text(f"Kirim 1-3 foto untuk banner {choice} (kirim foto satu per satu, /done jika selesai) — nanti jadi link Catbox → banners.json → push")
    # store photos
    context.user_data["banner_photos"] = []
    return BANNER_PHOTO

async def banner_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tf:
        await file.download_to_drive(tf.name)
        try:
            url = upload_catbox(tf.name)
            context.user_data["banner_photos"].append(url)
            await update.message.reply_text(f"✅ Foto banner terupload: {url} — kirim lagi atau /done")
        except Exception as e:
            await update.message.reply_text(f"❌ Upload gagal: {e}")
    return BANNER_PHOTO

async def banner_done(update: Update, context: ContextTypes.DEFAULT_TYPE):
    choice = context.user_data.get("banner_choice")
    photos = context.user_data.get("banner_photos", [])
    if not photos:
        await update.message.reply_text("❌ Belum ada foto, kirim foto dulu")
        return BANNER_PHOTO
    # load banners.json
    import json as _json
    data = _json.loads(BANNERS_JSON.read_text(encoding="utf-8")) if BANNERS_JSON.exists() else {"hero":[],"footer":""}
    if choice == "hero":
        data["hero"] = photos[:3]
    else:
        data["footer"] = photos[0]
    BANNERS_JSON.write_text(_json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    try:
        git_push(f"bot: banner {choice} {len(photos)} foto")
        await update.message.reply_text(f"✅ Banner {choice} update {len(photos)} foto — push done, Vercel deploy.\n" + "\n".join(photos))
    except Exception as e:
        await update.message.reply_text(f"⚠️ Simpan lokal OK tapi push gagal: {e}")
    return ConversationHandler.END

# --- ADD FLOW ---
async def add_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_allowed(update): return ConversationHandler.END
    drafts[update.effective_chat.id] = {"photos": [], "specs": []}
    await update.message.reply_text("📸 Kirim foto produk (1-4 foto, kirim satu per satu, ketik /done jika selesai) — atau /skip jika tanpa foto (pakai picsum)")
    return ASK_PHOTOS

async def add_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    draft = drafts.get(chat_id, {"photos": [], "specs": []})
    # download Telegram photo
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tf:
        await file.download_to_drive(tf.name)
        try:
            url = upload_catbox(tf.name)
            draft["photos"].append(url)
            await update.message.reply_text(f"✅ Foto ke-{len(draft['photos'])} terupload: {url}\nKirim lagi atau /done")
        except Exception as e:
            await update.message.reply_text(f"❌ Upload Catbox gagal: {e}")
    drafts[chat_id] = draft
    return ASK_PHOTOS

async def add_photo_done(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📝 Nama produk?")
    return ASK_NAME

async def add_photo_skip(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📝 Nama produk?")
    return ASK_NAME

async def ask_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    drafts[update.effective_chat.id]["name"] = update.message.text.strip()
    await update.message.reply_text("Brand? (Contoh: MicroBuild, Asus, dll)")
    return ASK_BRAND

async def ask_brand(update: Update, context: ContextTypes.DEFAULT_TYPE):
    drafts[update.effective_chat.id]["brand"] = update.message.text.strip()
    await update.message.reply_text(f"Kategori? Pilih: {', '.join(CATEGORIES)}")
    return ASK_CATEGORY

async def ask_category(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cat = update.message.text.strip()
    if cat not in CATEGORIES:
        await update.message.reply_text(f"Kategori harus salah satu: {', '.join(CATEGORIES)}")
        return ASK_CATEGORY
    drafts[update.effective_chat.id]["category"] = cat
    await update.message.reply_text("Harga? (angka saja, contoh: 18500000)")
    return ASK_PRICE

async def ask_price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        v = int(update.message.text.strip().replace(".", "").replace(",", ""))
    except:
        await update.message.reply_text("Harga harus angka, contoh: 18500000")
        return ASK_PRICE
    drafts[update.effective_chat.id]["price"] = v
    await update.message.reply_text("Potongan harga oldPrice? (angka atau kosong jika tidak ada, contoh: 20900000)")
    return ASK_OLDPRICE

async def ask_oldprice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    txt = update.message.text.strip()
    if txt == "" or txt.lower() in ["-", "skip", "kosong"]:
        drafts[update.effective_chat.id]["oldPrice"] = None
    else:
        try:
            drafts[update.effective_chat.id]["oldPrice"] = int(txt.replace(".", "").replace(",", ""))
        except:
            await update.message.reply_text("OldPrice angka atau kosong")
            return ASK_OLDPRICE
    await update.message.reply_text("Stock? (angka, contoh: 12)")
    return ASK_STOCK

async def ask_stock(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        v = int(update.message.text.strip())
    except:
        await update.message.reply_text("Stock angka")
        return ASK_STOCK
    drafts[update.effective_chat.id]["stock"] = v
    await update.message.reply_text("Kondisi? Ketik Baru atau Bekas")
    return ASK_CONDITION

async def ask_condition(update: Update, context: ContextTypes.DEFAULT_TYPE):
    c = update.message.text.strip()
    if c not in ["Baru", "Bekas"]:
        await update.message.reply_text("Ketik Baru atau Bekas")
        return ASK_CONDITION
    drafts[update.effective_chat.id]["condition"] = c
    await update.message.reply_text("Short description? (1 kalimat pendek)")
    return ASK_SHORTDESC

async def ask_shortdesc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    drafts[update.effective_chat.id]["shortDescription"] = update.message.text.strip()
    await update.message.reply_text("Deskripsi panjang? (boleh beberapa baris)")
    return ASK_DESC

async def ask_desc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    drafts[update.effective_chat.id]["description"] = update.message.text.strip()
    drafts[update.effective_chat.id]["specs"] = []
    await update.message.reply_text("Specs: ketik baris \"Label: Value\" satu per satu (contoh: Prosesor: Intel i7). Ketik /done jika selesai.")
    return ASK_SPECS

async def ask_specs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    txt = update.message.text.strip()
    if txt == "/done":
        await update.message.reply_text("Link Tokopedia? (kosongkan jika tidak ada, ketik -)")
        return ASK_TOKPED
    if ":" not in txt:
        await update.message.reply_text("Format harus \"Label: Value\" — contoh: RAM: 16GB DDR5")
        return ASK_SPECS
    label, value = [s.strip() for s in txt.split(":", 1)]
    drafts[update.effective_chat.id]["specs"].append({"label": label, "value": value})
    await update.message.reply_text(f"✅ Spec {label}: {value} — lanjut atau /done")
    return ASK_SPECS

async def ask_tokped(update: Update, context: ContextTypes.DEFAULT_TYPE):
    txt = update.message.text.strip()
    drafts[update.effective_chat.id]["tokopediaUrl"] = "" if txt in ["", "-", "skip"] else txt
    await update.message.reply_text("Link Shopee? (kosongkan jika tidak ada)")
    return ASK_SHOPEE

async def ask_shopee(update: Update, context: ContextTypes.DEFAULT_TYPE):
    txt = update.message.text.strip()
    drafts[update.effective_chat.id]["shopeeUrl"] = "" if txt in ["", "-", "skip"] else txt
    d = drafts[update.effective_chat.id]
    # preview
    preview = (
        f"📋 Preview:\n"
        f"Nama: {d.get('name')}\nBrand: {d.get('brand')} | Kategori: {d.get('category')}\n"
        f"Harga: {d.get('price')} | Old: {d.get('oldPrice')} | Stock: {d.get('stock')} | {d.get('condition')}\n"
        f"Foto: {len(d.get('photos',[]))} url\n"
        f"Specs: {len(d.get('specs',[]))} item\n"
        f"Tokped: {d.get('tokopediaUrl') or '-'} | Shopee: {d.get('shopeeUrl') or '-'}\n"
        f"Ketik /confirm untuk simpan & push ke GitHub, atau /cancel"
    )
    await update.message.reply_text(preview)
    return CONFIRM

async def confirm_add(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    d = drafts.get(chat_id)
    if not d:
        await update.message.reply_text("❌ Draft hilang, ulang /add")
        return ConversationHandler.END
    # build product
    import re
    slug = re.sub(r"[^a-z0-9]+", "-", d["name"].lower()).strip("-")[:50]
    # ensure unique
    products = load_products()
    base = slug
    i = 1
    while any(p["id"] == slug for p in products):
        slug = f"{base}-{i}"
        i += 1
    photos = d.get("photos") or []
    # fallback picsum if no photos
    if not photos:
        photos = [f"https://picsum.photos/seed/{slug}/600/600"]
    image = photos[0]
    gallery = photos[:4] if len(photos) >= 2 else [photos[0]] + [f"https://picsum.photos/seed/{slug}-{j}/800/800" for j in range(2,5)][:3]
    new_product = {
        "id": slug,
        "name": d["name"],
        "brand": d["brand"],
        "category": d["category"],
        "price": d["price"],
        "rating": 4.5,
        "sold": 0,
        "stock": d["stock"],
        "condition": d["condition"],
        "location": "Batam",
        "shortDescription": d["shortDescription"],
        "description": d["description"],
        "specs": d["specs"],
        "images": len(gallery),
        "image": image,
        "gallery": gallery,
        "tokopediaUrl": d.get("tokopediaUrl",""),
        "shopeeUrl": d.get("shopeeUrl",""),
    }
    if d.get("oldPrice"):
        new_product["oldPrice"] = d["oldPrice"]
    products.append(new_product)
    save_products(products)
    try:
        git_push(f"bot: add {slug}")
        await update.message.reply_text(f"✅ Berhasil tambah {slug} — sudah push ke GitHub, Vercel lagi deploy (±30s).\nLink: https://buana-computer.vercel.app/produk/{slug}")
    except Exception as e:
        await update.message.reply_text(f"⚠️ Simpan lokal OK tapi push gagal: {e}\nFile di src/data/products.json sudah update, push manual: git push")
    drafts.pop(chat_id, None)
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    drafts.pop(update.effective_chat.id, None)
    await update.message.reply_text("❌ Batal")
    return ConversationHandler.END

def main():
    if not TELEGRAM_TOKEN:
        print("TELEGRAM_TOKEN belum di set di .env")
        return
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("list", list_cmd))
    app.add_handler(CommandHandler("stock", stock_cmd))
    app.add_handler(CommandHandler("hapus", hapus_cmd))
    app.add_handler(CommandHandler("edit", edit_start))
    app.add_handler(CommandHandler("banner", banner_start))

    conv = ConversationHandler(
        entry_points=[CommandHandler("add", add_start)],
        states={
            ASK_PHOTOS: [MessageHandler(filters.PHOTO, add_photo), CommandHandler("done", add_photo_done), CommandHandler("skip", add_photo_skip)],
            ASK_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_name)],
            ASK_BRAND: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_brand)],
            ASK_CATEGORY: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_category)],
            ASK_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_price)],
            ASK_OLDPRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_oldprice)],
            ASK_STOCK: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_stock)],
            ASK_CONDITION: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_condition)],
            ASK_SHORTDESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_shortdesc)],
            ASK_DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_desc)],
            ASK_SPECS: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_specs), CommandHandler("done", ask_specs)],
            ASK_TOKPED: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_tokped)],
            ASK_SHOPEE: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_shopee)],
            CONFIRM: [CommandHandler("confirm", confirm_add), CommandHandler("cancel", cancel)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(conv)

    edit_conv = ConversationHandler(
        entry_points=[CommandHandler("edit", edit_start)],
        states={
            EDIT_CHOOSE_FIELD: [MessageHandler(filters.TEXT & ~filters.COMMAND, edit_choose_field)],
            EDIT_NEW_VALUE: [MessageHandler(filters.TEXT & ~filters.COMMAND, edit_new_value)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(edit_conv)

    banner_conv = ConversationHandler(
        entry_points=[CommandHandler("banner", banner_start)],
        states={
            BANNER_CHOICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, banner_choice)],
            BANNER_PHOTO: [MessageHandler(filters.PHOTO, banner_photo), CommandHandler("done", banner_done)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(banner_conv)
    print("Bot jalan — polling...")
    app.run_polling()

if __name__ == "__main__":
    main()
