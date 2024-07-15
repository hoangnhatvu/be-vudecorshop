import axios from 'axios'

const token = process.env.GHN_API_KEY

const createOrder = async (data: any) => {
  try {
    const endpoint = process.env.GHN_URL
    const body = {
      payment_type_id: 1,
      required_note: 'CHOXEMHANGKHONGTHU',
      to_name: data.to_name,
      to_phone: data.to_phone,
      to_address: data.to_address,
      to_ward_code: data.to_ward_code,
      to_district_id: data.to_district_id,
      cod_amount: data.cod_amount,
      weight: 2000,
      length: 1,
      width: 19,
      height: 10,
      service_id: 0,
      service_type_id: 2,
      items: data.items,
    }

    const response = await axios.post(endpoint, body, {
      headers: {
        Token: token,
        ShopId: process.env.GHN_SHOP_ID,
      },
    })

    return response?.data
  } catch (error) {
    throw error
  }
}

const cancelOrder = async (order_code: string) => {
  try {
    const endpoint = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel'
    const body = {
      order_codes: [order_code],
    }

    const response = await axios.post(endpoint, body, {
      headers: {
        Token: token,
        ShopId: '190512',
      },
    })

    return response?.data
  } catch (error) {
    throw error
  }
}

export { createOrder, cancelOrder }
