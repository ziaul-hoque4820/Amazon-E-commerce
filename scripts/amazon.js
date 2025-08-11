import { addToCart, cart } from "../data/cart.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";

let productsHTML = "";

products.forEach((product) => {
    const existingCartItem = cart.find(cartItem => cartItem.productId === product.id);
    const inCartQty = existingCartItem ? existingCartItem.quantity : 0;

    productsHTML += `
            <div class="product-container">
                <div class="product-image-container">
                    <img class="product-image" src="${product.image}">
                </div>

                <div class="product-name limit-text-to-2-lines">
                    ${product.name}
                </div>

                <div class="product-rating-container">
                    <img class="product-rating-stars" src="images/ratings/rating-${product.rating.stars * 10}.png">
                    <div class="product-rating-count link-primary">
                        ${product.rating.count}
                    </div>
                </div>

                <div class="product-price">
                    $${formatCurrency(product.priceCents)}
                </div>

                <div class="product-quantity-container">
                    <select class="js-quantity-selector" data-product-id="${product.id}">
                        ${quantitySelector()}
                    </select>

                    <div class="js-in-cart-qty in-cart-qty" style="${inCartQty > 0 ? '' : 'display:none;'}">
                        ${inCartQty > 0 ? `In cart: ${inCartQty}` : ""}
                    </div>
                </div>

                <div class="product-spacer"></div>

                <div class="added-to-cart">
                    <img src="images/icons/checkmark.png">
                    Added
                </div>

                <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
    `
});
document.querySelector('.js-products-grid').innerHTML = productsHTML;

function updateCartQuantity() {
    let cartQuantity = 0;

    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });
    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
};

function quantitySelector() {
    let optionsHTML = '';

    for (let v = 1; v <= 10; v++) {
        let selected = v === 1 ? 'selected' : '';
        optionsHTML += `<option value="${v}" ${selected}>${v}</option>`;
    }

    return optionsHTML;
}

document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
        const productId = button.dataset.productId;
        const productContainer = button.closest('.product-container');

        const quantitySelector = productContainer.querySelector('.js-quantity-selector');
        const selectedQuantity = parseInt(quantitySelector.value, 10) || 1;

        addToCart(productId, selectedQuantity);

        // UI update in-cart level
        const inCartLabel = productContainer.querySelector('.js-in-cart-qty');
        const newQty = cart.find(cartItem => cartItem.productId === productId)?.quantity || 0;

        if (newQty > 0) {
            inCartLabel.textContent = `In cart: ${newQty}`;
            inCartLabel.style.display = 'block';
        } else {
            inCartLabel.style.display = 'none';
        }

        // reset Selector, default value 1
        if (quantitySelector) quantitySelector.value = '1';

        updateCartQuantity();
        showAddedMessage(productContainer);
    });
});

function showAddedMessage(productContainer) {
    const addedMessage = productContainer.querySelector('.added-to-cart');
    addedMessage.style.opacity = '1';
    setTimeout(() => {
        addedMessage.style.opacity = '0';
    }, 1000);
};
