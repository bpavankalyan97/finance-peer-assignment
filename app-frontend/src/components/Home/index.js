import { Component } from "react"
import { Redirect } from "react-router-dom"
import Cookies from 'js-cookie'

import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

import Header from "../Header"
import DataItem from "../DataItem"
import './index.css'

const statusConstants = {
    initial: 'INITIAL',
    loading: 'LOADING',
    success: 'SUCCESS',
    failure: 'FAILURE',
    serverError: "SERVER_ERROR"
}

class Home extends Component{
    state = {
        pageNumber: 0,
        fileInputValue: '',
        fileObject: null,
        userData: null,
        showFileDetails: false,
        fetchStatus: statusConstants.initial
    }

    componentDidMount(){
        this.getStoredUserData()
    }

    getStoredUserData = async () => {
        this.setState({
            fetchStatus: statusConstants.loading
        })

        const getDataApiUrl = "http://localhost:3001/data"
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${Cookies.get("jwt_token")}`
            }
        }

        try{
            const response = await fetch(getDataApiUrl, options)
            const jsonResponse = await response.json()

            if (response.ok){
                this.onFetchSuccessful(jsonResponse.data)
            }
            else{
                this.onFetchFailure()
            }
        }
        catch(error){
            console.log(error.message)
            this.onFetchFailure(true)
        }
    }

    onFetchSuccessful = data => {
        this.totalPages = Math.ceil(data.length/12)
        this.setState({
            userData: data,
            fetchStatus: statusConstants.success
        })
    }

    onFetchFailure = (serverError=false) => {
        this.setState({
            fetchStatus: serverError ? statusConstants.serverError : statusConstants.failure
        })
    }
    
    onInputChange = event => {
        const fileObject = event.target.files[0]

        if (fileObject.type === "application/json"){
            
            this.setState({
                fileInputValue: event.target.value,
                fileObject: fileObject,
                showFileDetails: true
            })

            /*const reader = new FileReader()
            reader.onload = e => {
                const text = JSON.parse(e.target.result)
                console.log(text)
            }
            reader.onloadstart = e => {
                console.log("started")
            }
            reader.onloadend = e => {
                console.log("end")
            }
            reader.readAsText(fileObject)*/
        }
        else{
            alert("Please choose JSON file only")
        }
    }

    readAndUploadData = () => {
        this.setState({
            pageNumber: 0,
            fileInputValue: '',
            showFileDetails: false,
            fetchStatus: statusConstants.loading
        })

        const {fileObject} = this.state

        const reader = new FileReader()
        reader.onload = e => {
            const data = JSON.parse(e.target.result)
            this.dataUploadApiCall({data})
        }
        reader.readAsText(fileObject)
    }

    dataUploadApiCall = async dataObject => {
        const uploadApiUrl = "http://localhost:3001/upload"
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${Cookies.get("jwt_token")}`
            },
            body: JSON.stringify(dataObject)
        }

        try{
            const response = await fetch(uploadApiUrl, options)

            if(response.ok){
                this.onFetchSuccessful(dataObject.data)
            }
            else{
                this.onFetchFailure()
            }
        }
        catch(error){
            console.log(error.message)
            this.onFetchFailure(true)
        }
    }

    decrementPageNumber = () => {
        const {pageNumber} = this.state
        if (pageNumber > 0){
            this.setState(preState => ({
                pageNumber: preState.pageNumber-1
            }))
        }
    }

    incrementPageNumber = () => {
        const {pageNumber} = this.state
        if (pageNumber < this.totalPages){
            this.setState(preState => ({
                pageNumber: preState.pageNumber+1
            }))
        }
    }

    displayFileDetailsContainer = () => {
        const {fileObject} = this.state

        return(
            <div className="file-details-container">
                <p className="file-detail-name">File Name: <span className="file-detail-value">{fileObject.name}</span></p>
                <p className="file-detail-name">File Size: <span className="file-detail-value">{`${Math.ceil(fileObject.size/1024)}KB`}</span></p>
                <p className="file-detail-name">Last Modified: <span className="file-detail-value">{fileObject.lastModifiedDate.toLocaleDateString()}</span></p>
                
                <button className="upload-button" type="button" onClick={this.readAndUploadData}>Upload</button>
            </div>
        )
    }

    renderUploadContainer = () => {
        const {fileInputValue, showFileDetails} = this.state

        return(
            <div className="upload-container">
                <h1 className="upload-heading">Choose a JSON to upload</h1>
                <input className="upload-input" type="file" value={fileInputValue} onChange={this.onInputChange}/>
                {showFileDetails && this.displayFileDetailsContainer()}
            </div>
        )
    }

    renderLoadingView = () => (
        <div className="failure-or-loading-container">
            <Loader type="TailSpin" color="blue" width={40} height={40}/>
        </div>
    )

    renderSuccessView = () => {
        const {userData, pageNumber} = this.state
        if (userData.length === 0){
            return this.renderFailureView("No Stored Data", "Please upload any JSON file to view your data")
        }

        const start = pageNumber * 12
        const end = start + 12

        return (
            <div>
                <h1 className="heading">Stored Data</h1>
                <ul className="user-data-container">
                    {userData.slice(start, end).map(object => 
                        <DataItem key={object.id} data={object}/>    
                    )}
                </ul>

                <div className="page-number-container">
                    <button type="button" onClick={this.decrementPageNumber}>Previous</button>
                    <p className="page-number">{pageNumber+1} of {this.totalPages}</p>
                    <button type="button" onClick={this.incrementPageNumber}>Next</button>
                </div>
            </div>
        )
    }

    renderFailureView = (title, description) => (
        <div className="failure-or-loading-container">
            <h1 className="failure-title">{title}</h1>
            <p className="failure-decription">{description}</p>
        </div>
    )

    renderUserDataSection = () => {
        const {fetchStatus} = this.state

        switch(fetchStatus){
            case statusConstants.loading:
                return this.renderLoadingView()
            
            case statusConstants.success:
                return this.renderSuccessView()
                
            case statusConstants.failure:
                return this.renderFailureView("Oops! Something went wrong", "Failed to retrive stored data, Please try again or upload a file.")
            
            case statusConstants.serverError:
                return this.renderFailureView("Server Error", "It seems like there is an issue at server end, Please retry after some time.")
                        
            default:
                return null
                                                    
        }
    }

    render(){
        const jwtToken = Cookies.get("jwt_token")
        if (jwtToken === undefined){
            return <Redirect to='/login'/>
        }

        return(
            <>
                <Header/>
                <div className="home-container">
                    {this.renderUploadContainer()}
                    {this.renderUserDataSection()}
                </div>
            </>
        )
    }
}

export default Home