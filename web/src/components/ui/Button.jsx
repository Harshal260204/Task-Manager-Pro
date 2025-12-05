import { Button as MuiButton } from '@mui/material'

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  sx,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      type={type}
      onClick={onClick}
      sx={{
        textTransform: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  )
}

export default Button

