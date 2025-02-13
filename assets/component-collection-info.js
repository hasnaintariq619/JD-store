function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

if (!customElements.get('collection-info')) {
  customElements.define(
    'collection-info',
    class CollectionInfo extends HTMLElement {
      constructor() {
        super();
        this.debounceOnChange = debounce((event) => this.onChangeHandler(event), 800);
        this.addEventListener('change', this.debounceOnChange.bind(this));
        this.addEventListener('click', this.onClickHandler.bind(this));
      }

      onClickHandler = (event) => {
        if (event.target.matches('[data-render-section-url]')) {
          event.preventDefault();
          const searchParams = new URLSearchParams(event.target.dataset.renderSectionUrl.split('?')[1]).toString();
          this.fetchSection(searchParams);
        }
      };

      onChangeHandler = (event) => {
        if (!event.target.matches('[data-render-section]')) return;
        const form =
          event.target.closest('form') || document.querySelector('#filters-form') || document.querySelector('#filters-form-drawer');
        const formData = new FormData(form);
        const searchParams = new URLSearchParams(formData).toString();
        this.fetchSection(searchParams);
      };

      get form() {
        return this.querySelector('collection-info form');
      }

      updateSourceFromDestination = (html, id) => {
        const source = html.getElementById(`${id}`);
        const destination = this.querySelector(`#${id}`);
        if (source && destination) {
          destination.innerHTML = source.innerHTML;
        }
      };

      updateURL(searchParams) {
        history.pushState({}, '', `${window.location.pathname}?${searchParams}`);
      }

      updateFilters = (html, className) => {
        const filtersFromFetch = html.querySelectorAll(`collection-info .${className}`);
        const filtersFromDom = document.querySelectorAll(`collection-info .${className}`);

        // Remove filters that are no longer returned from the server
        Array.from(filtersFromDom).forEach((currentElement) => {
          if (!Array.from(filtersFromFetch).some(({ id }) => currentElement.id === id)) {
            currentElement.remove();
          }
        });

        Array.from(filtersFromFetch).forEach((elementToRender, index) => {
          document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
        });
      };

      showLoadingOverlay = () => {
        this.querySelector(`#loading-overlay-${this.dataset.section}`).style.display = 'flex';
        this.querySelector(`#loading-spinner-${this.dataset.section}`).style.display = 'block';
        this.querySelector(`#results-count-${this.dataset.section}`).style.display = 'none';
        if (this.querySelector(`#drawer-results-count-${this.dataset.section}`)) {
          this.querySelector(`#drawer-results-count-${this.dataset.section}`).style.display = 'none';
        }
        if (this.querySelector(`#drawer-loading-spinner-${this.dataset.section}`)) {
          this.querySelector(`#drawer-loading-spinner-${this.dataset.section}`).style.display = 'block';
        }
      };

      hideLoadingOverlay = () => {
        this.querySelector(`#loading-overlay-${this.dataset.section}`).style.display = 'none';
        this.querySelector(`#loading-spinner-${this.dataset.section}`).style.display = 'none';
        this.querySelector(`#results-count-${this.dataset.section}`).style.display = 'block';
        if (this.querySelector(`#drawer-results-count-${this.dataset.section}`)) {
          this.querySelector(`#drawer-results-count-${this.dataset.section}`).style.display = 'block';
        }
        if (this.querySelector(`#drawer-loading-spinner-${this.dataset.section}`)) {
          this.querySelector(`#drawer-loading-spinner-${this.dataset.section}`).style.display = 'none';
        }
      };

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
          })
          .catch((error) => {
            console.error(error);
            this.hideLoadingOverlay();
          });
      };
    }
  );
}