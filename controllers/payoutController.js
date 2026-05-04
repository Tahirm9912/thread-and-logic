import {pool} from "../config/db"

export const getPayoutPage = async (req, res) => {
  try {
    const orderId = req.query.order;

    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    const items = await pool.query(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.productid
      WHERE oi.order_id = $1
    `, [orderId]);

    res.render("layouts/payout", {
      order: order.rows[0],
      items: items.rows
    });

  } catch (err) {
    console.log(err);
    res.send("error");
  }
};


export const getPayoutPage = async (req, res) => {
  try {
    const orderId = req.query.order;

    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    const items = await pool.query(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.productid
      WHERE oi.order_id = $1
    `, [orderId]);

    res.render("layouts/payout", {
      order: order.rows[0],
      items: items.rows
    });

  } catch (err) {
    console.log(err);
    res.send("error");
  }
};