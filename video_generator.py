import subprocess
import sys
import os

def generate_video(image_pattern, output_file, framerate=1):
    """
    Generates a video from a sequence of images using ffmpeg.

    Args:
        image_pattern (str): The pattern of the input images, e.g., 'image_%03d.png'
        output_file (str): The name of the output video file, e.g., 'output.mp4'
        framerate (int): The framerate of the output video.
    """
    command = [
        "ffmpeg",
        "-y",               # Overwrite output file without asking
        "-framerate", str(framerate),
        "-i", image_pattern,
        "-c:v", "libx264",  # Video codec
        "-r", "30",         # Output framerate
        "-pix_fmt", "yuv420p", # Pixel format for maximum compatibility
        output_file
    ]

    print(f"Running command: {' '.join(command)}")

    try:
        # Note: as per the KB, arguments are passed as a list
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Video generated successfully: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error generating video: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python video_generator.py <image_pattern> <output_file> [framerate]")
        sys.exit(1)

    pattern = sys.argv[1]
    output = sys.argv[2]
    fps = int(sys.argv[3]) if len(sys.argv) > 3 else 1

    generate_video(pattern, output, fps)
