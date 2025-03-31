const nodemaile = require('nodemailer')



exports.mailbox = (req, res) => {
    const userinfo = req.body
    // 提供发送验证码的服务商
    const transporter = nodemaile.createTransport({
        host: 'smtp.qq.com',
        secureConnection: true,
        port: 465,
        secure: true,
        auth: {
            user: '3449261457@qq.com',
            pass: 'oxklqjesmkcidbfd'
        }
    })

    // 随机生成的验证码
    const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')

    // 发送给送谁
    const mailOptions = {
        from: '3449261457@qq.com',
        to: `${userinfo.qq}`,
        subject: '农乐购',
        text: `
        这是您的验证码:
        ${number}
        请尽快进行验证。
        此邮件为系统邮件，请勿回复。
        `

    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.send(err)
        } else {
            res.send(number)
        }
    })

}


