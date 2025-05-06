package com.suryansh.visitorentry.controller;

import com.suryansh.visitorentry.service.interfaces.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * This Controller handle files operation like create, read.
 * This is a simple Http-Rest controller.
 * @author suryansh
 */
@RestController
@RequestMapping("api/v1/file")
@CrossOrigin("*")
public class FileController {
    private final FileService fileService;
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * This method is used to add new images.
     * This is POST Method.
     *
     * @param file Multipart file.
     * @param imageName File name
     * @return It will return a message whether the operation performed successfully or not.
     */
    @PostMapping("/new-image/{imageName}")
    public String uploadNewImage(@RequestParam("image")MultipartFile file,@PathVariable String imageName){
        return fileService.addNewImage(file,imageName);
    }

    /**
     * This method is used to get image by its name.
     * This is GET Method.
     *
     * @param name Image name as String.
     * @return It returns ResponseEntity including Byte Array.
     * @throws IOException It can throw IOException.
     */
    @GetMapping("/image-by-name/{name}")
    public ResponseEntity<byte[]> getImageByName(@PathVariable String name) throws IOException {
        byte[] image = fileService.getImage(name);
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png")).body(image);
    }

    @PostMapping("/update-old-image/{name}")
    public void updateImageIfPresentOrAddNew(@PathVariable String name,
                                             @RequestParam("image") MultipartFile file){
        fileService.handleUpdateImage(name, file);
    }


}
