package com.financapro.api.controller;

import com.financapro.api.model.Transaction;
import com.financapro.api.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Permite integração direta com o app React/Vite
public class TransactionController {

    @Autowired
    private TransactionRepository repository;

    @GetMapping
    public List<Transaction> getAll() {
        return repository.findAllByOrderByDataDesc();
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        Transaction saved = repository.save(transaction);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable String id, @RequestBody Transaction details) {
        return repository.findById(id)
            .map(tx -> {
                tx.setDescricao(details.getDescricao());
                tx.setValor(details.getValor());
                tx.setTipo(details.getTipo());
                tx.setCategoria(details.getCategoria());
                tx.setData(details.getData());
                tx.setObservacao(details.getObservacao());
                return ResponseEntity.ok(repository.save(tx));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
