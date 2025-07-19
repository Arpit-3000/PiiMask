# piimask 🛡️

A lightweight and efficient web-based tool for detecting and masking Personally Identifiable Information (PII) from uploaded documents using OCR (Optical Character Recognition) and regex-based masking.

## Live View- https://pii-mask.vercel.app/

## 🚀 Features

- 🔍 Extracts text from images using Tesseract.js (OCR)
- 🔐 Masks PII like:
  - Aadhaar Numbers
  - PAN Cards
  - Phone Numbers
  - Email Addresses
  - Dates of Birth
- 📸 Supports image upload and preview
- ⚡ Real-time progress display during OCR processing
- 📦 Simple and clean UI with React (optional)

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript (or React)
- OCR: [Tesseract.js](https://github.com/naptha/tesseract.js)
- PII Detection: Regex patterns
