class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.querySelectorAll('.color-swatch').forEach((s) => s.addEventListener('click', this.onSwatchClick.bind(this)));
  }

  onSwatchClick(event) {
    const swatch = event.target;
    const productImage = this.querySelector(`[data-product-image="${this.dataset.productId}"]`);
    const swatchImageElement = swatch.querySelector('.data-variant-image');
    const newImageUrl = swatchImageElement ? swatchImageElement.getAttribute('src') : null;
    const newSrcset = swatchImageElement ? swatchImageElement.getAttribute('srcset') : null;

    this.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
    swatch.classList.add('selected');

    if (productImage && swatchImageElement) {
      productImage.src = newImageUrl;
      productImage.srcset = newSrcset;
    }
  }
}

if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}