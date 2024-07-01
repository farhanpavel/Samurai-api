import { getDb,connectToDb } from "./db.js"
import express from 'express'
const app=express()
app.use(express.json())
let db
const startServer= async ()=>{
    try{
        await connectToDb()
        app.listen(8000,()=>{
            console.log('app is listening on port 8000')
        })
        db=getDb()
    }
    catch(err){
        console.log('error is coming')
        throw err
    }
}
// users
app.get("/api/users",async (req,res)=>{
    try{
       const books=await db.collection('users').find().toArray()
       res.status(200).json(books) 
    }
    catch(err){
        res.status(500).json({error:'api get is not working'})
    }
})
app.post("/api/users",async (req,res)=>{
    try{
       const reqData=req.body 
       const users=await db.collection('users').insertOne(reqData)
       res.status(201).json(users) 
    }
    catch(err){
        res.status(500)
    }
})
// stations
app.post("/api/stations",async (req,res)=>{
    try{
       const reqData=req.body 
       const station=await db.collection('stations').insertOne(reqData)
       res.status(201).json(station) 
    }
    catch(err){
        res.status(500)
    }
})


app.get("/api/stations",async (req,res)=>{
    try{
       const station=await db.collection('stations').find().sort({station_id:1}).toArray()
       res.status(200).json({stations:station}) 
    }
    catch(err){
        res.status(500).json({error:'api get is not working'})
    }
})


// trains
app.post("/api/trains",async (req,res)=>{
    try{
       const reqData=req.body
       const trainClone=await db.collection('trainsclone').insertOne(reqData)
       
       const stops=reqData.stops
       const trainNum=stops.length 
       const serviceStart=stops.find(e=>e.departure_time!==null).departure_time
       const serviceEnd=stops.find(e=>e.arrival_time!==null && e.departure_time===null).arrival_time
       const responseData={
        train_id: reqData.train_id,
        train_name: reqData.train_name,
        capacity: reqData.capacity,
        service_start: serviceStart,
        service_ends: serviceEnd,
        num_stations: trainNum
        }
       const train=await db.collection('trains').insertOne(responseData)
       res.status(201).json(train) 
    }
    catch(err){
        res.status(500)
    }
})
app.get("/api/stations/:id/trains",async (req,res)=>{
    try{
       const stationId=req.params.id
       const stationData=await db.collection('trainsclone').find().toArray()
       const result=[]
       stationData.forEach(train=>
            train.stops.forEach(e=>
                {
                    if(e.station_id===parseInt(stationId)){
                        result.push(
                            {
                                train_id:train.train_id,
                                arrival_time:e.arrival_time,
                                departure_time:e.departure_time,
                                fare:e.fare
                            }
                        )
                    }
                }
                )

        )
                
       res.status(201).json({station_id:stationId,trains:result}) 
    }
    catch(err){
          res.status(404).json({message: `station with id: ${req.params.id} was not found`})
    }
})
app.get("/api/wallets/:id",async(req,res)=>{
    try{
        const walletId=parseInt(req.params.id)
        const wallet=await db.collection('users').find().toArray()
        const result=wallet.find(e=> e.user_id===walletId)
        const walletData={
            wallet_id:result.user_id,
            balance:result.balance,
            wallet_user:{
                user_id:result.user_id,
                user_name:result.user_name
            }
        }
        res.status(200).json(walletData)
    
       
        
    }
    catch(err){
        res.status(404).json({message: `station with id: ${req.params.id} was not found`})
    }
    

})


app.put("/api/wallets/:id",async(req,res)=>{
    try{
        const walletChecker=req.body.recharge
        if(walletChecker>=100 && walletChecker<=10000)
        {const walletId=parseInt(req.params.id)
        
        const wallet=await db.collection('users').find().toArray()
        const result=wallet.find(e=> e.user_id===walletId)
        const walletData={
            wallet_id:result.user_id,
            balance:parseInt(result.balance+req.body.recharge),
            wallet_user:{
                user_id:result.user_id,
                user_name:result.user_name
            }
        }
        await db.collection('users').updateOne({user_id:parseInt(walletId)},{$set:{balance:req.body.recharge+result.balance}})
        res.status(200).json(walletData)
        }
        else{
            res.status(400).json({message: `invalid amount: ${walletChecker}`})
        }
    }
    catch(err){
        res.status(404).json({message: `wallet with id: ${req.params.id} was not found`})
    }
    

})


startServer()