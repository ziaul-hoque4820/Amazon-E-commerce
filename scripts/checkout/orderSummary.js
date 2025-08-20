import { cart, removeFromCart, saveToStorage, updateDeliveryOption } from "../../data/cart.js";
import { deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js";
import { getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js'
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary() {
    let cartSummaryHTML = "";

    cart.forEach((cartItem) => {
        const productId = cartItem.productId;

        const matchingProduct = getProduct(productId);

        const deliveryOptionId = cartItem.deliveryOptionId;

        const deliveryOption = getDeliveryOption(deliveryOptionId);

        const today = dayjs();
        const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
        const dateString = deliveryDate.format('dddd, MMMM D');


        cartSummaryHTML += `
        <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
            <div class="delivery-date">
                Delivery date: ${dateString}
            </div>

            <div class="cart-item-details-grid">
                <img class="product-image" src="${matchingProduct.image}">

                <div class="cart-item-details">
                    <div class="product-name">
                        ${matchingProduct.name}
                    </div>
                    <div class="product-price">
                        $${formatCurrency(matchingProduct.priceCents)}
                    </div>
                    <div class="product-quantity js-product-quantity" data-product-id="${matchingProduct.id}">
                        <span>
                            Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                        </span>
                        <span class="update-quantity-link link-primary js-update-quantity">
                            Update
                        </span>
                        <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                            Delete
                        </span>
                    </div>
                </div>

                <div class="delivery-options">
                    <div class="delivery-options-title">
                        Choose a delivery option:
                    </div>
                    ${deliveryOptionsHTML(matchingProduct, cartItem)}
                </div>
            </div>
        </div>
    `
    });

    function deliveryOptionsHTML(matchingProduct, cartItem) {
        let html = "";

        deliveryOptions.forEach((deliveryOption) => {
            const today = dayjs();
            const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
            const dateString = deliveryDate.format('dddd, MMMM D');

            const priceString = deliveryOption.priceCents === 0
                ? 'FREE'
                : `$${formatCurrency(deliveryOption.priceCents)} -`

            const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

            html += `
            <div class="delivery-option js-delivery-option"
            data-product-id='${matchingProduct.id}'
            data-delivery-option-id="${deliveryOption.id}">
                <input type="radio"
                ${isChecked ? "checked" : ""}
                class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
                <div>
                    <div class="delivery-option-date">
                        ${dateString}
                    </div>
                    <div class="delivery-option-price">
                        ${priceString} - Shipping
                    </div>
                </div>
            </div>
        `
        });

        return html;
    }
    document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

    document.querySelectorAll('.js-delete-link').forEach((link) => {
        link.addEventListener('click', () => {
            const productId = link.dataset.productId;
            removeFromCart(productId);

            const container = document.querySelector(`.js-cart-item-container-${productId}`)
            container.remove();

            renderPaymentSummary();
        });
    });

    document.querySelectorAll('.js-delivery-option').forEach((element) => {
        element.addEventListener('click', () => {
            const { productId, deliveryOptionId } = element.dataset;
            updateDeliveryOption(productId, deliveryOptionId);
            renderOrderSummary();
            renderPaymentSummary();
        });
    });

    document.querySelectorAll('.js-update-quantity').forEach((element) => {
        element.addEventListener('click', () => {
            const parent = element.closest('.js-product-quantity');
            const productId = parent.dataset.productId;
            const currentQty = parseInt(parent.querySelector('.quantity-label').textContent, 10);

            // Replace quantity text + update button with input + save button
            parent.innerHTML = `
                <span>
                    Quantity: 
                    <input type="number" class="quantity-input" min="1" value="${currentQty}">
                </span>
                <button class="save-quantity-button">Save</button>
            `;

            const input = parent.querySelector('.quantity-input');
            const saveBtn = parent.querySelector('.save-quantity-button');

            // Save button click
            saveBtn.addEventListener('click', () => {
                let newQty = parseInt(input.value, 10);

                if (isNaN(newQty) || newQty < 1) {
                    newQty = 1; // invalid হলে default 1
                }

                // Update cart data
                const cartItem = cart.find(item => item.productId === productId);
                if (cartItem) {
                    cartItem.quantity = newQty;
                    saveToStorage();
                }

                // Re-render order summary + payment summary
                renderOrderSummary();
                renderPaymentSummary();
            });

        })
    })

};