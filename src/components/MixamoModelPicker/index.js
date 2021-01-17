import React from "react";

export default class MixamoModelPicker extends React.Component{
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        fetch({
            method:"POST",
            url: "https://auth.services.adobe.com/signin/v2/tokens?credential=password",
            headers: {
                'Content-Type': 'application/json',
                "access-control-allow-credentials": true,
                "access-control-allow-origin": "https://auth.services.adobe.com"
            },
            body: JSON.stringify({
                username: "",
                password: "",
                accountType: "individual"
            })
        }).then((response)=>{
            console.log(response);
        }).catch(err=>{
            console.error(err);
        });
    }
    render() {
        return(
            <div>Hello world</div>
        )
    }
}