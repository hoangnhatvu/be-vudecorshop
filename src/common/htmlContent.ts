export const htmlContentPaymentSuccess = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Open Sans', sans-serif;
        }

        .container {
            display: flex;
            flex-direction: column;
            padding: 16px;
        }

        .checkDone {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 32px;
            flex: 1;
        }

        .textCheckDone {
            font-family: 'Open Sans', sans-serif;
            font-size: 24px;
            color: green;
            font-weight: bold;
        }

        .textThanks {
            font-family: 'Open Sans', sans-serif;
            font-size: 18px;
            color: #2A4D50; 
            text-align: center;
            font-weight: 600;
        }

        .buttonWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
        }

        button {
            width: 60%;
            padding: 10px;
            font-size: 16px;
            background-color: #2A4D50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkDone">
            <p class="textCheckDone">Đặt hàng thành công !</p>
            <ion-icon name="checkmark-done-circle-outline" style="font-size: 250px; color: green;"></ion-icon>
            <p class="textThanks">
                Cảm ơn bạn đã đặt hàng, đơn hàng của bạn sẽ nhanh chóng được xác nhận!
            </p>
        </div>
        <div class="buttonWrapper">
            <button onclick="continueShopping()">Tiếp tục mua sắm</button>
        </div>
    </div>

    <script>
        function continueShopping() {
            window.ReactNativeWebView.postMessage("continueShopping");
        }
    </script>
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
</body>
</html>
`;

export const htmlContentPaymentFail = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Open Sans', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f8d7da;
        }

        .container {
            text-align: center;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .errorIcon {
            font-size: 100px;
            color: #dc3545;
            margin-bottom: 20px;
        }

        .textFailed {
            font-size: 24px;
            color: #dc3545;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .textDescription {
            font-size: 18px;
            color: #6c757d;
            margin-bottom: 20px;
        }

        .buttonWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="errorIcon">❌</div>
        <p class="textFailed">Thanh toán thất bại</p>
        <p class="textDescription">Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.</p>
        <div class="buttonWrapper">
            <button onclick="retryPayment()">Tiếp tục mua sắm</button>
        </div>
    </div>

    <script>
        function retryPayment() {
            window.ReactNativeWebView.postMessage("retryPayment");
        }
    </script>
</body>
</html>
`;
