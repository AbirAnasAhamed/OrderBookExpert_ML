"""
app/services/ml/lstm_model.py
──────────────────────────────
PyTorch LSTM Architecture for Order Book Sequence Prediction.
Takes a sequence of past N ticks and outputs a 3-class probability distribution:
0: BEARISH, 1: NEUTRAL, 2: BULLISH
"""
import torch
import torch.nn as nn

class OrderBookLSTM(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 2, dropout: float = 0.2):
        super(OrderBookLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        # LSTM Layer
        # batch_first=True means input shape should be (batch, seq_len, input_dim)
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )

        # Fully Connected Layer
        self.fc1 = nn.Linear(hidden_dim, 32)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(32, 1) # Binary classification: 1 (UP), 0 (DOWN)

    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        
        # Initialize hidden state and cell state with zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        
        # Forward propagate LSTM
        # out shape: (batch_size, seq_len, hidden_dim)
        out, _ = self.lstm(x, (h0, c0))
        
        # Decode the hidden state of the last time step
        # out[:, -1, :] takes the last sequence's output
        last_out = out[:, -1, :]
        
        # FC layers
        x_fc = self.fc1(last_out)
        x_fc = self.relu(x_fc)
        x_fc = self.dropout(x_fc)
        logits = self.fc2(x_fc)
        
        return logits
