import express from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json())
app.get("/hello", async (req, res) => {
    res.send("Hello World");
});
app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    //TODO: We should also check if the transaction is already processed
    const checkTransaction= await db.onRampTransaction.findFirst({
        where: {
            token: req.body.token,
            status: "Processing"
        }
    });
    if(checkTransaction){
        return res.send("Transaction already processed");
    }
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
  console.log(paymentInformation.userId,paymentInformation.token,paymentInformation.amount);
    try {
        await db.$transaction([
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        // You can also get this from your DB
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch(e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})

app.listen(3003);