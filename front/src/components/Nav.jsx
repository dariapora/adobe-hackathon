import { useState } from 'react';
import { Box, NavLink, Button, Stack } from '@mantine/core';

const data = [
  { label: 'Home' },
  { label: 'Team' },
  { label: 'Experience' },
  { label: 'Chat' },
  { label: 'Schedule' },
];

export default function Nav({ onAddPost, onSelect }) {
  const [active, setActive] = useState(0);

  const items = data.map((item, index) => (
    <NavLink
      key={item.label}
      active={index === active}
      label={item.label}
      description={item.description}
      rightSection={item.rightSection}
      leftSection={item.icon ? <item.icon size={16} stroke={1.5} /> : null}
      onClick={() => {
        setActive(index);
        if (onSelect) onSelect(item.label);
      }}
    />
  ));

  return (
    <Box w={220}>
      <Stack gap="xs">
        <Button color="checkin" onClick={onAddPost}>Add post</Button>
        {items}
      </Stack>
    </Box>
  );
}
