import { withRouter } from 'react-router-dom'
import {CgProfile} from 'react-icons/cg'
import Cookies from 'js-cookie'
import './index.css'

const Header = props => {
    const clearCookieslogoutUser = () => {
        Cookies.remove('jwt_token')
        Cookies.remove('user_firstname')

        const {history} = props
        history.replace('/login')
    }

    return(
        <nav className='navbar'>
            <CgProfile className='profile-icon'/>
            <h2 className='profile-name'>{Cookies.get('user_firstname')}</h2>
            <button className='logout-button' type='button' onClick={clearCookieslogoutUser}>Logout</button>
        </nav>
    )
}

export default withRouter(Header)