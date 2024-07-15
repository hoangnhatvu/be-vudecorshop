import axios from 'axios'

const token = '101e2d64-95a3-11ee-b1d4-92b443b7a897'

const createOrder = async (data) => {
  try {
    const endpoint = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create'
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
        ShopId: '190512',
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
