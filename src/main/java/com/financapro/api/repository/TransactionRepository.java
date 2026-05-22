package com.financapro.api.repository;

import com.financapro.api.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    
    // Busca todas as transações ordenadas por data descendente (mais recentes primeiro)
    List<Transaction> findAllByOrderByDataDesc();
}
