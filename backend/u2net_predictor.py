import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from huggingface_hub import hf_hub_download
from model.u2net import U2NET
import os
import requests
import urllib.request

class U2NETPredictor:
    def __init__(self):
        try:
            # Try working U²-Net repositories
            repositories = [
                "damli/u2net",
                "niraj128/u2net",
                "mikestealth/u2net"
            ]
            
            model_path = None
            
            # First try Hugging Face repositories
            for repo_id in repositories:
                try:
                    print(f"Trying to download from {repo_id}...")
                    model_path = hf_hub_download(
                        repo_id=repo_id,
                        filename="u2net.pth",
                        cache_dir="./model_cache"
                    )
                    print(f"Successfully downloaded from {repo_id}")
                    break
                except Exception as e:
                    print(f"Failed to download from {repo_id}: {e}")
                    continue
            
            # If all HF repositories fail, try direct download
            if model_path is None:
                print("All Hugging Face repositories failed. Trying direct download...")
                model_path = self._download_model_direct()
            
            if model_path is None:
                raise Exception("Could not download model from any source")
            
            self.net = U2NET(3, 1)
            self.net.load_state_dict(torch.load(model_path, map_location="cpu"))
            self.net.eval()
            
            self.transform = transforms.Compose([
                transforms.Resize((320, 320)),
                transforms.ToTensor(),
                transforms.Normalize((0.485, 0.456, 0.406),
                                     (0.229, 0.224, 0.225))
            ])
            
            print(f"U²-Net model loaded successfully from {model_path}")
            
        except Exception as e:
            print(f"Error loading U²-Net model: {e}")
            print("Please check your internet connection and try again.")
            raise

    def _download_model_direct(self):
        """Download U²-Net model from direct URLs"""
        cache_dir = "./model_cache"
        os.makedirs(cache_dir, exist_ok=True)
        model_path = os.path.join(cache_dir, "u2net.pth")
        
        # Direct download URLs for U²-Net model
        urls = [
            "https://github.com/xuebinqin/U-2-Net/releases/download/v1.0/u2net.pth",
            "https://huggingface.co/spaces/nateraw/u2net/resolve/main/u2net.pth",
            "https://github.com/xuebinqin/U-2-Net/raw/master/model/u2net.pth"
        ]
        
        for url in urls:
            try:
                print(f"Trying direct download from: {url}")
                
                # Download with progress bar
                response = requests.get(url, stream=True)
                response.raise_for_status()
                
                total_size = int(response.headers.get('content-length', 0))
                block_size = 8192
                downloaded = 0
                
                with open(model_path, 'wb') as f:
                    for data in response.iter_content(block_size):
                        f.write(data)
                        downloaded += len(data)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            print(f"\rDownloading: {percent:.1f}%", end='', flush=True)
                
                print(f"\n✅ Model downloaded successfully!")
                print(f"   Size: {os.path.getsize(model_path) / (1024*1024):.1f} MB")
                return model_path
                
            except Exception as e:
                print(f"❌ Failed to download from {url}: {e}")
                continue
        
        return None

    def remove_bg(self, image: Image.Image) -> Image.Image:
        try:
            inp = self.transform(image).unsqueeze(0)
            with torch.no_grad():
                d1, _, _, _, _, _, _ = self.net(inp)
                pred = d1[:, 0, :, :]
                pred = (pred - pred.min()) / (pred.max() - pred.min())

            mask = pred.squeeze().cpu().numpy()
            mask = Image.fromarray((mask * 255).astype("uint8")).resize(image.size)
            rgba = image.convert("RGBA")
            datas = rgba.getdata()
            mask_data = mask.getdata()
            new_data = []
            for i, item in enumerate(datas):
                if mask_data[i] < 128:
                    new_data.append((item[0], item[1], item[2], 0))
                else:
                    new_data.append(item)
            rgba.putdata(new_data)
            return rgba
            
        except Exception as e:
            print(f"Error processing image: {e}")
            raise
