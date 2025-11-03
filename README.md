# Nepal Lipi OCR (Text Extraction)

A web-based OCR application designed specifically for **Nepal Lipi** (also referred to as Prachalit Lipi), the historical script of the Kathmandu Valley. This project aims to digitize and preserve invaluable cultural and historical knowledge stored in ancient manuscripts and artifacts.

This system evaluates, compares, and recognizes Nepal Lipi text using four prominent OCR engines:
- EasyOCR
- PaddleOCR
- TesseractOCR
- CalamariOCR

This application is based on the published research paper: **[Comparing OCR Engines for Nepal Lipi Extraction](https://ncci.ku.edu.np/uploads/archive/1770520563058-Nepal_Lipi_Text_Extrction-1-Pratik-Sharma.pdf)** by Pragyan Shrestha, Samriddha Lal Shrestha, Pratik Sharma, Ranjita Dhakal, Prabal Lamichhane, and Rajani Chulyadyo (Kathmandu University, Nepal). 

According to the study, CalamariOCR emerged as the top-performing model achieving a Character Error Rate (CER) of 3.75%, with PaddleOCR as the second most effective model at 9.06%.

## Project Structure

- `ocr-backend/`: A Django-based backend application handling image processing and acting as an interface to the OCR engines.
- `ocr-frontend/`: A Vite/React frontend application providing an intuitive UI for users to upload images and compare the outputs of different OCR engines.

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ocr-backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the environment variables:
   - Copy `.env.example` to a new file named `.env`
   - Fill in the required secrets (e.g., `SECRET_KEY`, `DEBUG` status, `CORS_ALLOW_ALL_ORIGINS`)
5. Run the migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

> **Note regarding OCR Engine Configuration:** The current `views.py` file uses specific hardcoded local paths (e.g., `c:/nepalbhasa/...`) to invoke the external OCR engines. To run this project correctly on your local machine, you must ensure your environment has the corresponding models installed at those exact locations, or you will need to update the absolute paths in `ocr-backend/ocr/views.py`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ocr-frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Future Work

- Dynamically configure OCR engine paths using environment variables instead of hardcoded paths.
- Enhance CalamariOCR model integration via direct Python bindings rather than spawning subprocesses.
