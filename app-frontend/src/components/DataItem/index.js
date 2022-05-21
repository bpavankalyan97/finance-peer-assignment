import "./index.css"

const DataItem = props => {
    const {data} = props
    const {id, userId, title, body} = data

    return(
        <li className="data-item-container">
            <div className="li-data-card">
                <div className="li-ids-container">
                    <p className="li-id">ID: {id}</p>
                    <p className="li-user-id">User ID: {userId}</p>
                </div>
                <h3 className="li-title">{title}</h3>
                <p className="li-body">{body}</p>
            </div>
        </li>
    )
}

export default DataItem