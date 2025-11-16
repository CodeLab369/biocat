import { Toaster } from 'sonner'
import { AppRoutes } from './routes/AppRoutes.jsx'

const App = () => (
  <>
    <AppRoutes />
    <Toaster position="top-center" richColors />
  </>
)

export default App
