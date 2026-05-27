# model/compliance_bert_bilstm_crf.py
import torch
import torch.nn as nn
from transformers import BertModel

class ComplianceBERTBiLSTMCRF(nn.Module):
    def __init__(self, num_labels=4, hidden_size=256):
        super().__init__()
        # Layer 1: BERT 预训练模型
        self.bert = BertModel.from_pretrained("bert-base-chinese")
        bert_hidden_size = 768
        # Layer 2: BiLSTM
        self.bilstm = nn.LSTM(
            input_size=bert_hidden_size,
            hidden_size=hidden_size,
            num_layers=2,
            bidirectional=True,
            batch_first=True,
            dropout=0.3
        )
        # BiLSTM输出大小 = 2 * hidden_size (前向+反向)
        lstm_output_size = hidden_size * 2
        # 投影层（BiLSTM输出 → 标签空间）
        self.dense = nn.Linear(lstm_output_size, num_labels)
        # Layer 3: CRF
        from torchcrf import CRF
        self.crf = CRF(num_labels, batch_first=True)
        self.num_labels = num_labels
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, input_ids, attention_mask, labels=None):
        # Step 1: BERT编码
        bert_output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = bert_output.last_hidden_state # (batch_size, seq_length, 768)
        # Step 2: Dropout + BiLSTM
        sequence_output = self.dropout(sequence_output)
        lstm_output, _ = self.bilstm(sequence_output) # (batch_size, seq_length, 512)
        lstm_output = self.dropout(lstm_output)
        # Step 3: 投影到标签空间
        logits = self.dense(lstm_output) # (batch_size, seq_length, num_labels)
        # Step 4: CRF
        if labels is not None:
            # 训练模式：计算CRF loss
            loss = -self.crf(logits, labels, mask=attention_mask.byte())
            return loss
        else:
            # 推理模式：解码最优路径
            predictions = self.crf.decode(logits, mask=attention_mask.byte())
            return predictions