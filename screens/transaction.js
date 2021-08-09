import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, ViewComponent, Image,KeyboardAvoidingView ,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData: '',
        buttonState: 'normal',
        scannedBookId:'',
        scannedStudentId:''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState}=this.state
      if (buttonState==='BookId'){
      
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
    }
    else  if (buttonState==='StudentId'){
      
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
    }
  }

handleTransaction =()=>{ 
  console.log('sumbit')
  var transactionmessage
  db.collection("books").doc(this.state.scannedBookId).get().then((doc)=>{
    var book=doc.data()
   if (book.bookAvailablitiy){
     transactionmessage='bookIssued'
     this.initiatebookIssue()
     ToastAndroid.show(transactionmessage,ToastAndroid.SHORT)

   }
   else {
     transactionmessage='bookReturned'
     this.initiatebookReturn()
     ToastAndroid.show(transactionmessage,ToastAndroid.SHORT)
   }
   console.log(transactionmessage)
  })
}

initiatebookIssue=()=>{
db.collection('transactions').add({
  'studentId':this.state.scannedStudentId,
  'bookId':this.state.scannedBookId,
  'date ':firebase.firestore.Timestamp.now().toDate(),
  'transactionType':'issue'
})

db.collection('books').doc(this.state.scannedBookId).update({'bookAvaiblitiy':false

})

db.collection('students').doc(this.state.scannedStudentId).update({'numberOfBookIssused':firebase.firestore.FieldValue.increment(1)

})

this.setState({
  scannedBookId:'',
  scannedStudentId:''
})

}
initiatebookReturn=()=>{
  db.collection('transactions').add({
    'studentId':this.state.scannedStudentId,
    'bookId':this.state.scannedBookId,
    'date ':firebase.firestore.Timestamp.now().toDate(),
    'transactionType':'return'
  })
  
  db.collection('books').doc(this.state.scannedBookId).update({'bookAvaiblitiy':true
  
  })
  
  db.collection('students').doc(this.state.scannedStudentId).update({'numberOfBookIssused':firebase.firestore.FieldValue.increment(-1)
  
  })
  
  this.setState({
    scannedBookId:'',
    scannedStudentId:''
  })
}
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal"&& hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />)
         ;
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behaviour='padding' enabled style={styles.container}>
            <View> 
              <Image style = {{width:200,height:200}} source = {require('../assets/booklogo.jpg')} />
              <Text style = {{textAlign:'center',fontSize:30}}>  Willy </Text>
            </View>
            <View style ={styles.inputView} > 
            <TextInput style ={styles.inputBox} 
            onChangeText={text=>this.setState({scannedBookId:text})}
            placeholder = 'book id' value ={this.state.scannedBookId} />
            <TouchableOpacity style = {styles.scanButton}
            onPress = {
              ()=>{
                this.getCameraPermissions('BookId')
              }
            }> 
              <Text> scan </Text>
            </TouchableOpacity>
            </View>
            <View style ={styles.inputView} > 
            <TextInput style ={styles.inputBox}
            onChangeText={text=>this.setState({scannedStudentId:text})}
            placeholder = 'Student Id' value ={this.state.scannedStudentiId} />
            <TouchableOpacity style = {styles.scanButton}
            onPress = {
              ()=>{
                this.getCameraPermissions('StudentId')
              }
            }> 
              <Text> scan </Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style = {styles.submitButton} onPress ={async()=>{
              this.handleTransaction()
              this.setState({
                scannedBookId:'',
                scannedStudentId:''
              })
              }} >
              <Text style = {styles.submitButtonText}>
                SUBMIT
              </Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
        );
      }
    }
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    },
    inputView:{
      flexDirection:'row'
    },
    inputBox:{
      width:200,
      height:40,
      borderWidth:1.5,
      fontSize:20
    },
     scanButton:{
       backgroundColor:'green',
       width:50,
       borderWidth:1.5
     },
  
      submitButton:{
        backgroundColor:'green',
        width:100,
        height:15,
      },

       submitButtonText:{
         textAlign:'center',
         fontSize:20,
         color:'white' 
       }    

  });