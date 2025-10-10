// src/models/Voucher.js
import mongoose from 'mongoose';
const RedemptionSchema = new mongoose.Schema({ userId:String, username:String, redeemedAt:{type:Date,default:Date.now}, quantity:{type:Number,default:1,min:1} }, { _id:false });
const VoucherSchema = new mongoose.Schema({
  codeHash:{type:String,unique:true,index:true,required:true},
  codeDisplay:String,
  batchId:{type:String,index:true},
  competitionSlug:{type:String,index:true,required:true},
  ticketCount:{type:Number,default:1,min:1},
  maxRedemptions:{type:Number,default:1,min:1},
  usedCount:{type:Number,default:0,min:0},
  redeemedCount:{type:Number,default:0,min:0},
  perUserLimit:{type:Number,default:1,min:1},
  assignedToUserId:{type:String,default:null},
  redemptions:{ type:[RedemptionSchema], default: [] },   // <-- important
  lastRedeemedAt:{type:Date,default:null},
  expiresAt:{type:Date,default:null},
  createdBy:String,
  notes:{type:String,default:''},
},{timestamps:true});
export default mongoose.models.Voucher || mongoose.model('Voucher', VoucherSchema);
