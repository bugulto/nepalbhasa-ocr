import subprocess
import tempfile
import os
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def ocr_view(request):
    image_file = request.FILES.get("image")
    ocr_engine = request.POST.get("ocr_engine")

    valid_engines = ("paddleocr", "easyocr", "calamari", "tesseract")
    if not image_file or ocr_engine not in valid_engines:
        return JsonResponse({"error": "Invalid request. Please provide an image and a valid ocr_engine."}, status=400)

    temp_dir = tempfile.mkdtemp(dir=r"D:\\temp\\")
    safe_filename = os.path.basename(image_file.name)
    tmp_path = os.path.join(temp_dir, safe_filename)

    with open(tmp_path, "wb+") as dest:
        for chunk in image_file.chunks():
            dest.write(chunk)

    command = []
    if ocr_engine == "paddleocr":
        command = [
            "c:/nepalbhasa/myenv/Scripts/python.exe",
            "c:/nepalbhasa/paddleocr/tools/infer/predict_rec.py",
            f"--image_dir={tmp_path}",
            "--rec_model_dir=c:/nepalbhasa/paddleocr/inference/",
        ]
    elif ocr_engine == "easyocr":
        command = [
            "c:/nepalbhasa/easyocr-env/Scripts/python.exe",
            "c:/nepalbhasa/deep-text-recognition-benchmark/demo.py",
            "--Transformation", "TPS",
            "--FeatureExtraction", "ResNet",
            "--SequenceModeling", "BiLSTM",
            "--Prediction", "Attn",
            "--image_folder", temp_dir,
            "--gt_csv", "c:/nepalbhasa/deep-text-recognition-benchmark/augmented_labels.csv",
            "--saved_model", "c:/nepalbhasa/deep-text-recognition-benchmark/saved_models/saved_models/experiment_1/best_accuracy.pth",
            "--character", "◌𑐀𑐁𑐂𑐃𑐄𑐅𑐆𑐊𑐋𑐌𑐎𑐏𑐐𑐑𑐒𑐔𑐕𑐖𑐗𑐘𑐚𑐛𑐜𑐝𑐞𑐟𑐠𑐡𑐢𑐣𑐥𑐦𑐧𑐨𑐩𑐫𑐬𑐮𑐰𑐱𑐲𑐳𑐴𑐵𑐶𑐷𑐸𑐹𑐺𑐾𑑀𑑁𑑂𑑃𑑄𑑅𑑉𑑋𑑌𑑍𑑐𑑑𑑒",
        ]
    elif ocr_engine == "calamari":
        command = [
            "c:/nepalbhasa/calamari-env/Scripts/calamari-predict.exe",
            "--checkpoint", "C:/nepalbhasa/model_output1.3/best.ckpt",
            "--data.images", tmp_path,
            "--verbose", "True"
        ]
    elif ocr_engine == "tesseract":
        command = [
            "tesseract",
            tmp_path,
            "stdout",  
            "-l", "ranjana"
        ]

    try:
        print(f"\n--- Executing command ({ocr_engine}) ---\n{' '.join(command)}\n")

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False 
        )
        
        stdout = result.stdout
        stderr = result.stderr

        print(f"--- SCRIPT STDOUT ({ocr_engine}) ---")
        print(stdout)
        print(f"--- SCRIPT STDERR ({ocr_engine}) ---")
        print(stderr)
        print("--------------------------")

        # --- Output Parsing ---
        if result.returncode != 0 and ocr_engine != 'easyocr': 
             return JsonResponse({"error": "OCR process failed", "details": stderr}, status=500)

        if ocr_engine == "paddleocr":
            pred_match = re.search(r"Predicts of .*?:\s*\('(.+?)',\s*([\d.]+)\)", stdout)
            cer_match = re.search(r"CER for .*?:\s*([\d.]+)", stdout)
            return JsonResponse({
                "predicted_text": pred_match.group(1).strip() if pred_match else None,
                "confidence": float(pred_match.group(2)) if pred_match else None,
                "cer": float(cer_match.group(1)) if cer_match else None,
            })
            
        elif ocr_engine == "easyocr":
            data_line_match = re.search(
                r"^(?P<image_path>[A-Z]:\\.+?)\s+(?P<predicted_text>.+?)\s+(?P<confidence>[\d.]+)\s+(?P<cer>[\d.]+)$",
                stdout, re.MULTILINE
            )
            avg_cer_match = re.search(r"Average CER:\s*([\d.]+)", stdout)

            if not data_line_match:
                return JsonResponse({"error": "Failed to parse easyocr output", "stdout": stdout, "stderr": stderr}, status=500)

            return JsonResponse({
                "predicted_text": data_line_match.group("predicted_text").strip(),
                "confidence": float(data_line_match.group("confidence")),
                "cer": float(data_line_match.group("cer")),
                "average_cer": float(avg_cer_match.group(1)) if avg_cer_match else None,
            })


        elif ocr_engine == "calamari":
            txt_path = os.path.splitext(tmp_path)[0] + ".pred.txt"
            print(f"Expected Calamari output file: {txt_path}")

            if not os.path.exists(txt_path):
                return JsonResponse({
                    "error": "Calamari output file not found.",
                    "expected_path": txt_path
                }, status=500)

            with open(txt_path, "r", encoding="utf-8") as f:
                predicted_text = f.read().strip()

            base_name = image_file.name.replace(".jpg", ".gt.txt")
            gt_path = os.path.join("C:/nepalbhasa/deep-text-recognition-benchmark/test-subjects", base_name)

            cer = None  # Default

            if os.path.exists(gt_path):
                try:
                    eval_cmd = [
                        "c:/nepalbhasa/calamari-env/Scripts/calamari-eval.exe",
                        "--gt.texts", gt_path
                    ]
                    print(f"Running calamari-eval with command: {' '.join(eval_cmd)}")
                    result = subprocess.run(eval_cmd, capture_output=True, text=True, check=True)
                    cer_match = re.search(r"Got mean normalized label error rate of ([\d.]+)%", result.stdout)
                    if cer_match:
                        cer = float(cer_match.group(1)) / 100  

                except subprocess.CalledProcessError as e:
                    return JsonResponse({
                        "error": "Failed to run calamari-eval",
                        "stderr": e.stderr,
                        "stdout": e.stdout,
                        "gt_path": gt_path
                    }, status=500)
            else:
                print(f"Ground truth file not found at {gt_path}, skipping CER calculation.")

            return JsonResponse({
                "predicted_text": predicted_text,
                "confidence": None,
                "cer": cer
            })



        elif ocr_engine == "tesseract":
            if not stdout.strip():
                 return JsonResponse({"error": "Tesseract produced no output.", "details": stderr}, status=500)
            
            return JsonResponse({
                "predicted_text": stdout.strip(),
                "confidence": None, 
            })

    finally:
            print("done")
            # if os.path.exists(temp_dir):
            #     for root, dirs, files in os.walk(temp_dir, topdown=False):
            #         for name in files:
            #             os.remove(os.path.join(root, name))
            #         for name in dirs:
            #             os.rmdir(os.path.join(root, name))
            #     os.rmdir(temp_dir)
