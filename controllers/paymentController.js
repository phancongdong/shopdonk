const { query } = require('../config/database');

async function getPaymentSettings(req, res) {
    try {
        const result = await query('SELECT * FROM PaymentSettings WHERE id = 1', []);
        const settings = result.recordset[0] || {
            bank_name: '',
            bank_account: '',
            bank_owner: '',
            momo_phone: '',
            momo_name: '',
            zalopay_phone: '',
            zalopay_name: '',
            vnpay_phone: '',
            vnpay_name: '',
            qr_code_url: '',
            chat_bubble_url: 'contact.html',
            chat_bubble_active: true
        };
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updatePaymentSettings(req, res) {
    try {
        const data = req.body;
        
        const checkResult = await query('SELECT * FROM PaymentSettings WHERE id = 1', []);
        
        if (checkResult.recordset.length === 0) {
            await query(`
                INSERT INTO PaymentSettings (
                    id, bank_name, bank_account, bank_owner,
                    momo_phone, momo_name, zalopay_phone, zalopay_name,
                    vnpay_phone, vnpay_name, qr_code_url, 
                    chat_bubble_url, chat_bubble_active, created_at
                ) VALUES (
                    1, @param0, @param1, @param2, @param3, @param4,
                    @param5, @param6, @param7, @param8, @param9,
                    @param10, @param11, GETDATE()
                )
            `, [
                data.bank_name || '',
                data.bank_account || '',
                data.bank_owner || '',
                data.momo_phone || '',
                data.momo_name || '',
                data.zalopay_phone || '',
                data.zalopay_name || '',
                data.vnpay_phone || '',
                data.vnpay_name || '',
                data.qr_code_url || '',
                data.chat_bubble_url || 'contact.html',
                data.chat_bubble_active !== false ? 1 : 0
            ]);
        } else {
            await query(`
                UPDATE PaymentSettings SET
                    bank_name = @param0,
                    bank_account = @param1,
                    bank_owner = @param2,
                    momo_phone = @param3,
                    momo_name = @param4,
                    zalopay_phone = @param5,
                    zalopay_name = @param6,
                    vnpay_phone = @param7,
                    vnpay_name = @param8,
                    qr_code_url = @param9,
                    chat_bubble_url = @param10,
                    chat_bubble_active = @param11,
                    updated_at = GETDATE()
                WHERE id = 1
            `, [
                data.bank_name || '',
                data.bank_account || '',
                data.bank_owner || '',
                data.momo_phone || '',
                data.momo_name || '',
                data.zalopay_phone || '',
                data.zalopay_name || '',
                data.vnpay_phone || '',
                data.vnpay_name || '',
                data.qr_code_url || '',
                data.chat_bubble_url || 'contact.html',
                data.chat_bubble_active !== false ? 1 : 0
            ]);
        }
        
        res.json({
            success: true,
            message: 'Cập nhật thông tin thanh toán thành công!'
        });
    } catch (error) {
        console.error('Update payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

module.exports = {
    getPaymentSettings,
    updatePaymentSettings
};