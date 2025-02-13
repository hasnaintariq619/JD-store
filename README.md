# StarterTheme 0.2 Technical Documentation

## Collection Page Implementation (`main-collection.liquid`)

### Collection Filtering System

#### Core Components
1. `collection-info` Custom Element
2. Filter Forms (Horizontal, Vertical, or Drawer layout)
3. AJAX Update System
4. Loading States

#### Filter Form Implementation
The collection page uses forms to capture filter values. The form structure varies based on the `filter_type` setting:
- Horizontal: Filters displayed in a row at the top
- Vertical: Filters in a sidebar
- Drawer: Filters in a mobile-friendly drawer

#### AJAX Update Flow

1. **Event Handling**
The following code handles user interactions with filters. It includes two main event handlers:
- A debounced change handler that processes form input changes after an 800ms delay to prevent excessive requests
- A click handler specifically for active filter removal
```javascript
// Debounced change handler (800ms)
onChangeHandler = (event) => {
  if (!event.target.matches('[data-render-section]')) return;
  const form = event.target.closest('form') || 
               document.querySelector('#filters-form') || 
               document.querySelector('#filters-form-drawer');
  const formData = new FormData(form);
  const searchParams = new URLSearchParams(formData).toString();
  this.fetchSection(searchParams);
};

// Click handler for active filters
onClickHandler = (event) => {
  if (event.target.matches('[data-render-section-url]')) {
    event.preventDefault();
    const searchParams = new URLSearchParams(event.target.dataset.renderSectionUrl.split('?')[1]).toString();
    this.fetchSection(searchParams);
  }
};
```

2. **Section Fetching**
This code handles the AJAX request to update the collection page. It:
- Shows a loading overlay while fetching
- Updates multiple sections of the page with new content
- Maintains browser history state
- Updates the URL to reflect the current filters
```javascript
fetchSection = (searchParams) => {
  this.showLoadingOverlay();
  fetch(`${window.location.pathname}?section_id=${this.dataset.section}&${searchParams}`)
    .then((response) => response.text())
    .then((responseText) => {
      let html = new DOMParser().parseFromString(responseText, 'text/html');
      this.updateURL(searchParams);
      this.updateSourceFromDestination(html, `product-grid-${this.dataset.section}`);
      this.updateSourceFromDestination(html, `results-count-${this.dataset.section}`);
      this.updateSourceFromDestination(html, `drawer-results-count-${this.dataset.section}`);
      this.updateSourceFromDestination(html, `active-filter-group-${this.dataset.section}`);
      this.updateSourceFromDestination(html, `sort-by-drawer-${this.dataset.section}`);
      this.updateSourceFromDestination(html, `sort-by-${this.dataset.section}`);
      this.updateFilters(html, `js-filter`);
      this.hideLoadingOverlay();
    });
};
```

### Product Card Integration

#### Swatch System
The ProductCard component handles variant swatch interactions. This code:
- Initializes click listeners for color swatches
- Updates the product image when a swatch is clicked
- Manages the selected state of swatches
- Handles both src and srcset attributes for responsive images
```javascript
class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.querySelectorAll('.color-swatch').forEach((s) => 
      s.addEventListener('click', this.onSwatchClick.bind(this))
    );
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
```

### Loading States
These styles create a semi-transparent overlay with a centered spinner:
- The overlay covers the entire product grid while loading
- The spinner uses a border animation to create a loading effect
- Display properties are toggled via JavaScript to show/hide the loading state
```css
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.loading-overlay__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(var(--color-foreground), 0.1);
  border-top-color: rgb(var(--color-foreground));
  border-radius: 100%;
  animation: spin 0.6s infinite linear;
  display: none;
  position: absolute;
}
```

### Performance Considerations
1. Debounced filter updates (800ms delay)
2. Section-specific updates instead of full page reload
3. Efficient DOM updates using `innerHTML`
4. Loading states for user feedback

### Event Delegation
- Uses event delegation for dynamic elements
- Handles pagination and filter updates efficiently
- Maintains functionality after AJAX updates

### Theme Settings Integration
This Liquid code demonstrates how filter components are conditionally rendered based on theme settings:
- Checks if filtering is enabled
- Verifies the filter type is 'vertical'
- Passes the collapse_filters setting to the sidebar component
```liquid
{%- if section.settings.enable_filtering and section.settings.filter_type == 'vertical' -%}
  {% render 'component-filters-sidebar', results: collection, collapse_filters: section.settings.collapse_filters %}
{%- endif -%}
```

## Important Notes
- Form submission is prevented and handled via AJAX
- Filter state is maintained in URL parameters
- Loading states are managed per section
- Browser history is updated for proper navigation