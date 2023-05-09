const axios = require('axios');
const readline = require('readline');

var cartId;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const server = 'http://localhost:9000';

console.log('Creating cart..')
axios.post(`${server}/store/carts`).then(res => {
    cartId = res.data.cart.id;
    mainMenu();
});

function mainMenu() {
    console.clear();
    console.log('1. List products');
    console.log('2. Inspect product');
    console.log('3. Show cart');
    console.log('4. Checkout');
    console.log('5. Exit');
    askMainMenu();
};

function askMainMenu() {
    rl.question('Select an option: ', (answer) => {
        switch (answer) {
            case '1':
                listProducts();
                break;
            case '2':
                inspectProduct();
                break;
            case '3':
                showCart();
                break;
            case '4':
                checkout();
                break;
            case '5':
                process.exit(0);
                break;
            default:
                console.log('Invalid option')
                askMainMenu();
                break;
        };
    });
};

function askInspectProduct(product) {
    console.log('1. Add product to cart');
    console.log('2. Remove product from cart');
    console.log('3. Go to main menu');

    rl.question('Select an option: ', (answer) => {
        switch (answer) {
            case '1':
                addToCart(product);
                break;
            case '2':
                removeFromCart(product);
                break;
            case '3':
                console.clear();
                mainMenu();
                break;
            default:
                console.log('Invalid option')
                askMainMenu();
                break;
        };
    });
};

function listProducts() {
    axios.get(`${server}/store/products`).then(res => {
        res.data.products.forEach(product => {
            console.log(`${product.id}. ${product.title} - $${product.variants[0].prices[0].amount / 100}`);
        });
        askMainMenu();
    });
};

function inspectProduct() {
    rl.question('Product ID: ', (answer) => {
        axios.get(`${server}/store/products/${answer}`).then(res => {
            const product = res.data.product;
            console.log(`${product.title} - $${product.variants[0].prices[0].amount / 100}`);
            console.log(product.description);
            askInspectProduct(product);
        }).catch(err => {
            console.log('Product not found');
            askMainMenu();
        });
    });
};

function addToCart(product) {
    axios.post(`${server}/store/carts/${cartId}/line-items`, {
        variant_id: product.variants[0].id,
        quantity: 1
    }).then(res => {
        console.log('Product added to cart');
        askInspectProduct(product);
    });
};

function showCart() {
    if(cartId) {
        axios.get(`${server}/store/carts/${cartId}`).then(res => {
            const cart = res.data.cart;
            console.log(`Cart ID: ${cart.id}`);
            console.log(`Total: $${cart.total / 100}`);
            cart.items.forEach(item => {
                console.log(`${item.quantity}x ${item.title} - $${item.subtotal / 100}`);
            });
            askMainMenu();
        })
    }
};