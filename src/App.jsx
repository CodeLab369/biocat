import { Toaster } from 'sonner'
import { AppRoutes } from './routes/AppRoutes.jsx'
import { RouteRestorer } from './routes/RouteRestorer.jsx'

const App = () => (
  <>
    <RouteRestorer />
    <AppRoutes />
    <Toaster position="top-center" richColors />
  </>
)

export default App
