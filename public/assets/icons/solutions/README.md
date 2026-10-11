Original Twin Peaks solution icons, authored as SVG vectors for production use.

Each SVG uses a 24 x 24 viewBox, 1.7-unit stroke, rounded caps and joins, and a transparent background. The Angular icon component uses the same geometry and inherits the current text color.

Upload the PNG versions to the Django Service icon field. They are 512 x 512 pixels with a transparent background and a fixed brand blue (#164d6b) stroke. Django's ImageField validates raster images and does not accept these SVG source files.

When embedded as an image, use meaningful alt text unless the adjacent text already identifies the solution; in that case use empty alt text. To recolor, inline the SVG and set CSS color, or replace currentColor in the file with your desired color. Recommended display size: 24 pixels or larger.
