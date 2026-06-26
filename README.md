# GOODFILM App

เว็บ E-Catalog และระบบจัดการข้อมูล GOODFILM ประกอบด้วย React/Vite frontend และ Express/JSON Server backend

## เริ่มพัฒนาในเครื่อง

```powershell
npm install
npm run server
npm run dev
```

Vite จะ proxy API ไปที่ `http://127.0.0.1:3001` อัตโนมัติ ข้อมูล production จะไม่ถูกแก้ไขเมื่อ backend ใช้ `GOODFILM_DATA_DIR`, `GOODFILM_PUBLIC_DIR` และ `GOODFILM_BACKUP_DIR` ที่เป็นสำเนาสำหรับทดสอบ

## ตรวจสอบก่อน release

```powershell
npm run lint
npm test
npm run build
npm audit --omit=dev
```

## Environment สำหรับ production

คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่าต่อไปนี้ ห้าม commit `.env`

- `ADMIN_PASSWORD` รหัสผ่านหน้าแอดมิน
- `DOWNLOAD_PASSWORD` รหัสผ่านเอกสารดาวน์โหลด
- `ADMIN_SESSION_SECRET` ค่าสุ่มอย่างน้อย 32 ตัวอักษร
- `CORS_ALLOWED_ORIGINS` รายชื่อ frontend origins คั่นด้วย comma
- `CLOUDFLARE_TUNNEL_TOKEN` token ใหม่หลัง revoke token เดิม
- `VITE_API_URL` ใช้เฉพาะเมื่อ frontend และ API อยู่คนละ origin

Admin และ download sessions เป็น HttpOnly cookies อายุ 8 ชั่วโมง การเปิด `/download/...` โดยตรงจะได้ 401 จนกว่าจะยืนยันรหัสผ่านผ่านแอป

Production build จะไม่คัดลอก `public/download` เข้า `dist` เพื่อป้องกันการข้ามระบบรหัสผ่าน ห้ามอัปโหลดโฟลเดอร์ `public/download` ไปยัง static hosting โดยตรง

## Docker/NAS

```powershell
docker compose config
docker compose build --no-cache
docker compose up -d
docker compose ps
```

Container ทำงานด้วย user `node` (UID 1000) โฟลเดอร์ `public`, `data` และ `backups` บน NAS ต้องให้ UID 1000 เขียนได้ก่อน deploy มิฉะนั้นการอัปโหลดและสำรองฐานข้อมูลจะล้มเหลว

ก่อนสลับ production:

1. สำรอง `data/database.json`, `public` และ `backups`
2. Revoke Cloudflare Tunnel token เดิมและใส่ token ใหม่ใน `.env`
3. ตรวจ allowlist ให้มีเฉพาะโดเมนจริง
4. เปิด `/auth/status`, `/admin`, `/bostik-presentation` และทดสอบดาวน์โหลดหนึ่งไฟล์
5. เก็บ container/image เดิมไว้สำหรับ rollback

## Upload policy

- เอกสาร: PDF, JPG/JPEG, PNG ไม่เกิน 75 MB (รองรับไฟล์เดิมที่ใหญ่ที่สุด 58.7 MB)
- Portfolio/Banner: JPG/JPEG, PNG, WebP ไม่เกิน 10 MB
- หนึ่งไฟล์ต่อ request พร้อมตรวจ MIME, นามสกุล และ file signature

ไฟล์ SVG, HTML, JavaScript, ZIP และไฟล์ที่ปลอมชนิดจะถูกปฏิเสธ
