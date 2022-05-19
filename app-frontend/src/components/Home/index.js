import { Component } from "react"

class Home extends Component{
    state = {
        file: ''
    }
    
    onInputChange = event => {
        const fileObject = event.target.files[0]
        if (fileObject.type === "application/json"){
            
            this.setState({file: event.target.value})

            const reader = new FileReader()
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
            reader.readAsText(fileObject)
        }
        else{
            alert("Please choose JSON file only")
        }
    }

    render(){
        const {file} = this.state
        return(
            <input type="file" value={file} onChange={this.onInputChange}/>
        )
    }
}

export default Home