import {
  createProduct,
  addProductImage,
  addVariant,
  getAllProducts,
  getProductFull
} from "../models/productModel.js";



// ==========================
// 🟢 SHOW ALL PRODUCTS
// ==========================
export const showProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const data = await getProductFull(productId);

    // 🔥 THIS IS WHERE YOU PUT IT
    res.render("layouts/product", {
      product: data.product,
      images: data.images,
      variants: data.variants
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading product");
  }
};





// ==========================
// 🟢 ADD PRODUCT (ADMIN)
// ==========================
export const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      is_trending,
      is_top,
      is_featured,
      is_active,

      images,   // array
      variants  // array
    } = req.body;

    // 🟢 1. Create product
    const product = await createProduct({
      name,
      description,
      category,
      is_trending: is_trending === "on",
      is_top: is_top === "on",
      is_featured: is_featured === "on",
      is_active: is_active === "on"
    });

    // 🟢 2. Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await addProductImage(
          product.productid,
          images[i],
          i === 0 // first = primary
        );
      }
    }

    // 🟢 3. Insert variants
    if (variants && variants.length > 0) {
      for (let v of variants) {
        await addVariant({
          product_id: product.productid,
          color: v.color,
          size: v.size,
          fabric: v.fabric,
          piece_type: v.piece_type,
          stock: v.stock,
          price: v.price
        });
      }
    }

    return res.redirect("/admin/products");

  } catch (err) {
    console.log(err);
    return res.send("Error creating product");
  }
};


export const showProducts = async (req, res) => {
  const products = await getAllProducts();

  res.render("layouts/list", {
    products: products || []
  });
};