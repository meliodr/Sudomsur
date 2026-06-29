import os

# Create dummy images directly via bash calls since we don't know what python libraries are installed
os.system('mkdir -p dummy_images')

print("Generating dummy images with ImageMagick or standard tools...")
# if imagemagick is not installed we can just make a small python script that writes raw ppm files

ppm_header = "P3\n100 100\n255\n"
for i in range(1, 6):
    r = 255 if i % 3 == 1 else 0
    g = 255 if i % 3 == 2 else 0
    b = 255 if i % 3 == 0 else 0

    with open(f"dummy_images/img_{i:03d}.ppm", "w") as f:
        f.write(ppm_header)
        for _ in range(100 * 100):
            f.write(f"{r} {g} {b}\n")
    print(f"Generated dummy_images/img_{i:03d}.ppm")

print("Done generating 5 dummy images.")
