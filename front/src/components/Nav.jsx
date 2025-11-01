import { useState } from 'react';
import { Box, NavLink, Button, Stack } from '@mantine/core';

const data = [
  { label: 'Home'},
  { label: 'Chat' },
  { label: 'Schedule' },
];

export default function Nav({ onAddPost }) {
  const [active, setActive] = useState(0);

  const items = data.map((item, index) => (
    <NavLink
      key={item.label}
      active={index === active}
      label={item.label}
      description={item.description}
      rightSection={item.rightSection}
      leftSection={item.icon ? <item.icon size={16} stroke={1.5} /> : null}
      onClick={() => setActive(index)}
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
