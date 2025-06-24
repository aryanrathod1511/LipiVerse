import React from "react";
import { Button } from "./button";

interface SuggestionButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ label, onClick, loading, disabled }) => (
  <Button type="button" variant="outline" onClick={onClick} disabled={disabled || loading}>
    {loading ? "Loading..." : label}
  </Button>
);

export default SuggestionButton; 