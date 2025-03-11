import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import ListAltIcon from '@mui/icons-material/ListAlt'
import DescriptionIcon from '@mui/icons-material/Description'

const Header = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Electronics Component Finder
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          color={isActive('/') ? 'secondary' : 'inherit'}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
        <Button
          component={RouterLink}
          to="/parts-lists"
          color={isActive('/parts-lists') ? 'secondary' : 'inherit'}
          startIcon={<ListAltIcon />}
        >
          Parts Lists
        </Button>
        <Button
          component={RouterLink}
          to="/datasheets"
          color={isActive('/datasheets') ? 'secondary' : 'inherit'}
          startIcon={<DescriptionIcon />}
        >
          Datasheets
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Header 