import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './Auth.module.css';

export function Auth() {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to CheckIn!
        </Title>

        <TextInput label="Company mail address" placeholder="name@company.com" size="md" radius="md" />
        <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" radius="md" />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button color="#4c5897" fullWidth mt="xl" size="md" radius="md">
          Check In
        </Button>

        <Text ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor href="#" fw={500} c="#424E88" onClick={(event) => event.preventDefault()}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}