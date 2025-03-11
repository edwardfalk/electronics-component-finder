import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import { searchDatasheets, downloadDatasheet } from '../api/datasheets'
import type { Datasheet } from '../types'

const DatasheetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: datasheets, isLoading } = useQuery({
    queryKey: ['datasheets', searchTerm],
    queryFn: () => searchDatasheets(searchTerm),
    enabled: searchTerm.length > 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The query will automatically refetch when searchTerm changes
  }

  const handleDownload = async (id: string) => {
    try {
      const url = await downloadDatasheet(id)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Failed to download datasheet:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Component Datasheets
      </Typography>

      <form onSubmit={handleSearch}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              label="Search datasheets"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter component name, manufacturer, or part number"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              disabled={!searchTerm}
              sx={{ height: '100%' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </form>

      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {datasheets && datasheets.length > 0 && (
        <Grid container spacing={2}>
          {datasheets.map((datasheet: Datasheet) => (
            <Grid item xs={12} md={6} lg={4} key={datasheet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {datasheet.componentName}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {datasheet.manufacturer}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Part Number: {datasheet.partNumber}
                  </Typography>
                  <Typography variant="body2">
                    File Size: {Math.round(datasheet.fileSize / 1024)} KB
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(datasheet.id)}
                    aria-label="download datasheet"
                  >
                    <DownloadIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {datasheets && datasheets.length === 0 && searchTerm && (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No datasheets found matching your search criteria
        </Typography>
      )}
    </Box>
  )
}

export default DatasheetsPage 