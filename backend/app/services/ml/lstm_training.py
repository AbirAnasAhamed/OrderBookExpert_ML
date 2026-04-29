"""
app/services/ml/lstm_training.py
─────────────────────────────────
Training pipeline for the LSTM neural network using PyTorch.
"""
import os
import logging
import json
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

from app.services.ml.lstm_model import OrderBookLSTM

logger = logging.getLogger(__name__)

MODEL_DIR = "/app/models/weights"
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.pth")
SCALER_PATH = os.path.join(MODEL_DIR, "lstm_scaler.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "lstm_metrics.json")

def create_sequences(features: np.ndarray, targets: np.ndarray, seq_len: int = 10):
    """
    Creates overlapping sequences for LSTM input.
    """
    X, y = [], []
    for i in range(len(features) - seq_len):
        X.append(features[i : i + seq_len])
        # The target is the future price direction after the sequence ends
        y.append(targets[i + seq_len - 1])
    return np.array(X), np.array(y)

def train_lstm(df: pd.DataFrame, seq_len: int = 10, epochs: int = 10, batch_size: int = 64) -> dict:
    """
    Trains the PyTorch LSTM model on the provided dataframe.
    """
    if df.empty or "target" not in df.columns:
        raise ValueError("DataFrame is empty or missing 'target' column.")
    
    os.makedirs(MODEL_DIR, exist_ok=True)

    feature_cols = df.columns.drop("target")
    X_raw = df[feature_cols].values
    y_raw = df["target"].values

    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)
    joblib.dump(scaler, SCALER_PATH)

    # Create sequences
    X_seq, y_seq = create_sequences(X_scaled, y_raw, seq_len)
    
    if len(X_seq) < batch_size:
        raise ValueError("Not enough data to create sequences for LSTM training.")

    # Train / Test split
    split_idx = int(len(X_seq) * 0.8)
    X_train, X_test = X_seq[:split_idx], X_seq[split_idx:]
    y_train, y_test = y_seq[:split_idx], y_seq[split_idx:]

    # Convert to PyTorch tensors
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training LSTM on device: {device}")

    X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1).to(device)
    X_test_t = torch.tensor(X_test, dtype=torch.float32).to(device)
    y_test_t = torch.tensor(y_test, dtype=torch.float32).unsqueeze(1).to(device)

    train_data = TensorDataset(X_train_t, y_train_t)
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=False)

    # Initialize model
    model = OrderBookLSTM(input_dim=len(feature_cols)).to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
        logger.info(f"Epoch {epoch+1}/{epochs} | Loss: {epoch_loss/len(train_loader):.4f}")

    # Evaluation
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test_t)
        test_preds = torch.sigmoid(test_outputs).cpu().numpy()
        test_preds_binary = (test_preds > 0.5).astype(int)
        
        y_test_np = y_test_t.cpu().numpy()
        accuracy = np.mean(test_preds_binary == y_test_np)

    logger.info(f"LSTM Training Completed. Test Accuracy: {accuracy:.4f}")

    # Save the model state
    torch.save(model.state_dict(), LSTM_MODEL_PATH)
    logger.info(f"LSTM Model saved to {LSTM_MODEL_PATH}")

    # Save metrics
    metrics = {
        "accuracy": float(accuracy),
        "samples_trained": len(X_train),
        "samples_tested": len(X_test),
        "features": list(feature_cols),
        "epochs": epochs
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)

    return metrics
