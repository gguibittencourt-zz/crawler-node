import { Router } from 'express'
import SearchController from '@controllers/SearchController'

const routes = Router()

routes.post('/buscar', SearchController.search)

export default routes
