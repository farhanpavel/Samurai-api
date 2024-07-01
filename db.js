import { MongoClient } from "mongodb";
const url='mongodb://localhost:27017'
let dbConnect
export const connectToDb= async ()=>{
    try{
        const client=await MongoClient.connect(url)
         dbConnect=client.db('samurai')    
    }
    catch(err){
        console.log('Error On Data Promise')
        throw err
    }
 }
 export const getDb=()=>dbConnect