import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from './store/products/ActionCreators'
import {
  fetchGetAllFromCart,
  fetchUpdateCart
} from './store/cart/ActionCreators'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import AppRouter from './router/AppRouter'
import './styles/App.scss'
import {
  fetchUpdateWishlist,
  fetchWishlist
} from './store/wishlist/ActionCreator'
import { useLocation } from 'react-router-dom'
import { fetchGetUser } from './store/user/ActionCreators'
import { setLocation } from './store/location/location'
import { clearStatusOrder } from './store/order/order'
import UpToTop from './components/UpToTop/UpToTop'

function App() {
  const dispatch = useDispatch()
  const token = useSelector(state => state.auth.token)
  const locationHook = useLocation()
  const favItems = useSelector(state => state.wishlist.data)
  const { location } = useSelector(state => state.location)
  const cardInCart = useSelector(state => state.cart.data)

  useEffect(() => {
    dispatch(setLocation(locationHook.pathname))
    dispatch(fetchProducts())
    if (localStorage.getItem('userToken')) {
      localStorage.removeItem('userToken')
    }
    dispatch(clearStatusOrder())
  }, [dispatch, locationHook])

  useEffect(() => {
    if (token) {
      dispatch(fetchGetUser())
      dispatch(fetchWishlist())
      dispatch(fetchGetAllFromCart())
    }
  }, [token, dispatch])

  const sedtItemsFromLocalStorageCart = useCallback(() => {
    const cards = JSON.parse(localStorage.getItem('cart'))
    let arrayOfCards = []
    let result = {}

    if (cardInCart.products) {
      if (cardInCart.products !== 0) {
        cardInCart.products.forEach(item => {
          let step
          for (step = 0; step < item.cartQuantity; step++) {
            cards.push(item.product._id)
          }
        })
      }
    }

    cards.forEach(a => {
      if (result[a] !== undefined) ++result[a]
      else result[a] = 1
    })
    for (let key in result) {
      arrayOfCards.push({ product: key, cartQuantity: result[key] })
    }

    dispatch(fetchUpdateCart(arrayOfCards))
    localStorage.removeItem('cart')
  }, [cardInCart.products, dispatch])

  const sedtItemsFromLocalStorageWishlist = useCallback(() => {
    const favs = JSON.parse(localStorage.getItem('fav'))
    if (favItems) {
      if (favItems.length !== 0) {
        favItems.products.forEach(item => favs.push(item._id))
      }
    }

    const uniqueEl = new Set(favs)
    const uniqueToArray = Array.from(uniqueEl)
    dispatch(fetchUpdateWishlist(uniqueToArray))
    localStorage.removeItem('fav')
  }, [dispatch, favItems])

  useEffect(() => {
    if (token) {
      if (JSON.parse(localStorage.getItem('cart'))) {
        sedtItemsFromLocalStorageCart()
      }
      if (JSON.parse(localStorage.getItem('fav'))) {
        sedtItemsFromLocalStorageWishlist()
      }
    }
  }, [
    token,
    dispatch,
    sedtItemsFromLocalStorageCart,
    sedtItemsFromLocalStorageWishlist
  ])

  return (
    <>
      <Header />
      <AppRouter />
      {location !== '/login' ? <Footer /> : null}
      <UpToTop />
    </>
  )
}

export default App
