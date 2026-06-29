import os
import subprocess
import glob

def format_images(input_dir, output_dir, target_width=1280, target_height=720):
    os.makedirs(output_dir, exist_ok=True)

    # Get all image files
    extensions = ('*.png', '*.jpg', '*.jpeg')
    image_files = []
    for ext in extensions:
        image_files.extend(glob.glob(os.path.join(input_dir, ext)))

    image_files.sort()

    for i, file_path in enumerate(image_files):
        output_file = os.path.join(output_dir, f"frame_{i+1:03d}.jpg")

        # Scale to fit within target dimensions, then pad with black to reach exact target dimensions
        vf_filter = f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:color=black"

        command = [
            "ffmpeg",
            "-y",
            "-i", file_path,
            "-vf", vf_filter,
            output_file
        ]

        print(f"Formatting {file_path} -> {output_file}")
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print(f"Error processing {file_path}: {e}")
            print(e.stderr)

if __name__ == "__main__":
    format_images("user_images", "formatted_images")
    print("Image formatting complete.")
