import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { getPartsLists, createPartsList, deletePartsList } from '../api/partsLists'
import type { PartsList } from '../types'

const PartsListPage = () => {
  const [open, setOpen] = useState(false)
  const [newListName, setNewListName] = useState('')

  const { data: partsLists, refetch } = useQuery({
    queryKey: ['partsLists'],
    queryFn: getPartsLists,
  })

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await createPartsList({ name: newListName.trim() })
      setNewListName('')
      setOpen(false)
      refetch()
    }
  }

  const handleDeleteList = async (id: string) => {
    await deletePartsList(id)
    refetch()
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Parts Lists</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create New List
        </Button>
      </Box>

      {partsLists && partsLists.length > 0 ? (
        <List>
          {partsLists.map((list: PartsList) => (
            <ListItem key={list.id} divider>
              <ListItemText
                primary={list.name}
                secondary={`${list.components.length} components`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteList(list.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No parts lists created yet. Create your first list to get started!
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Parts List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateList} color="primary" disabled={!newListName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PartsListPage 