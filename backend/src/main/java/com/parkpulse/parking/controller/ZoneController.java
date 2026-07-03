package com.parkpulse.parking.controller;

import com.parkpulse.parking.dto.ZoneDTO;
import com.parkpulse.parking.model.Zone;
import com.parkpulse.parking.service.ZoneService;
import com.parkpulse.util.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    @Autowired
    private ZoneService zoneService;

    @GetMapping
    public List<ZoneDTO> getAllZones() {
        return zoneService.getAllZones().stream()
                .map(DtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<ZoneDTO> saveZone(@Valid @RequestBody ZoneDTO zoneDTO) {
        // If the DTO has a blank ID, set it to null so the UUID generator assigns a real one
        if (zoneDTO.getId() == null || zoneDTO.getId().isBlank()) {
            zoneDTO.setId(null);
        }
        Zone zone = DtoMapper.toEntity(zoneDTO);
        zoneService.saveZone(zone);
        return ResponseEntity.ok(DtoMapper.toDto(zone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable String id) {
        zoneService.deleteZone(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZoneDTO> getZone(@PathVariable String id) {
        return zoneService.getZoneById(id)
                .map(DtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZoneDTO> updateZone(@PathVariable String id, @Valid @RequestBody ZoneDTO zoneDTO) {
        Zone zone = DtoMapper.toEntity(zoneDTO);
        zone.setId(id);
        zoneService.saveZone(zone);
        return ResponseEntity.ok(DtoMapper.toDto(zone));
    }
}
