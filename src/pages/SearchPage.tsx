import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { searchComponents } from '../api/components'
import type { Component } from '../types'

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [shop, setShop] = useState('all')
  const [inStock, setInStock] = useState('all')

  const { data: components, isLoading } = useQuery({
    queryKey: ['components', searchTerm, category, shop, inStock],
    queryFn: () => searchComponents({ searchTerm, category, shop, inStock }),
    enabled: searchTerm.length > 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The query will automatically refetch when the search parameters change
  }

  return (
    <Box>
      <form onSubmit={handleSearch}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search components"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="resistors">Resistors</MenuItem>
                <MenuItem value="capacitors">Capacitors</MenuItem>
                <MenuItem value="inductors">Inductors</MenuItem>
                <MenuItem value="transistors">Transistors</MenuItem>
                <MenuItem value="ics">ICs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Shop</InputLabel>
              <Select value={shop} onChange={(e) => setShop(e.target.value)}>
                <MenuItem value="all">All Shops</MenuItem>
                <MenuItem value="electrokit">Electrokit</MenuItem>
                <MenuItem value="elfa">Elfa</MenuItem>
                <MenuItem value="mouser">Mouser</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Stock</InputLabel>
              <Select value={inStock} onChange={(e) => setInStock(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchIcon />}
          disabled={!searchTerm}
          sx={{ mb: 4 }}
        >
          Search
        </Button>
      </form>

      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {components && components.length > 0 && (
        <Grid container spacing={2}>
          {components.map((component: Component) => (
            <Grid item xs={12} md={6} lg={4} key={component.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {component.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {component.manufacturer}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {component.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip label={component.category} color="primary" />
                    <Chip label={component.shop} color="secondary" />
                    <Chip
                      label={component.inStock ? 'In Stock' : 'Out of Stock'}
                      color={component.inStock ? 'success' : 'error'}
                    />
                  </Box>
                  <Typography variant="h6" color="primary">
                    {component.price} SEK
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {components && components.length === 0 && searchTerm && (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No components found matching your search criteria
        </Typography>
      )}
    </Box>
  )
}

export default SearchPage 