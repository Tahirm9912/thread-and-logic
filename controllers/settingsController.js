import pool from "../config/db.js";

export const getSettingsPage = async (req, res) => {
  try {
    const settings = await pool.query(
      "SELECT * FROM site_settings WHERE setting_key LIKE 'carousel_%' OR setting_key LIKE 'popup_%' ORDER BY setting_key"
    );

    res.render("layouts/admin/settings", {
      settings: settings.rows,
      success: req.query.success === '1'
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("layouts/error", {
      message: "Could not load settings"
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      carousel_1,
      carousel_2,
      carousel_3,
      carousel_4,
      carousel_5,
      popup_image,
      popup_enabled
    } = req.body;

    // Handle checkbox - if array, take last value (true), otherwise it's false
    const popupValue = Array.isArray(popup_enabled) 
      ? popup_enabled[popup_enabled.length - 1] 
      : popup_enabled === 'true' ? 'true' : 'false';

    const updates = [
      { key: 'carousel_1', value: carousel_1 || '' },
      { key: 'carousel_2', value: carousel_2 || '' },
      { key: 'carousel_3', value: carousel_3 || '' },
      { key: 'carousel_4', value: carousel_4 || '' },
      { key: 'carousel_5', value: carousel_5 || '' },
      { key: 'popup_image', value: popup_image || '' },
      { key: 'popup_enabled', value: popupValue }
    ];

    for (let update of updates) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [update.key, update.value]
      );
    }

    res.redirect("/admin/settings?success=1");

  } catch (err) {
    console.error(err);
    res.redirect("/admin/settings?error=1");
  }
};